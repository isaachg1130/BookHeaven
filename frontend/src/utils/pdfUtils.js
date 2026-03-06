/**
 * Utility functions for PDF handling
 * Ahora con soporte para detección de contenido premium
 */

/**
 * Obtiene la URL de servicio de PDF
 * @param {string} type - Tipo de contenido ('libro', 'manga', 'comic')
 * @param {number} id - ID del contenido
 * @returns {string} - URL del endpoint de servicio de PDF
 */
export const getPdfServiceUrl = (type, id) => {
  return `/api/content/serve-pdf/${type}/${id}`;
};

/**
 * Abre un PDF con detección de contenido premium
 *
 * @param {Object} options - Opciones para abrir el PDF
 * @param {Object} options.content - Objeto del contenido
 * @param {string} options.type - Tipo de contenido ('libro', 'manga', 'comic')
 * @param {number} options.id - ID del contenido
 * @param {string} options.title - Título del contenido
 * @returns {Promise<Object>} - {success: boolean, error?: string, code?: string, ...}
 */
export const openPDF = async (options) => {
  const { content, type, id, navigateOnly = false } = options;

  if (!content && (!type || !id)) {
    console.warn("Invalid options for openPDF");
    return { success: false, error: "Opciones inválidas" };
  }

  if (navigateOnly) {
    // En este modo solo validamos el acceso antes de navegar
    try {
      const pdfUrl = getPdfServiceUrl(type, id);
      const response = await fetch(pdfUrl, {
        method: "HEAD", // Solo validación de cabeceras
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.message,
            code: errorData.code,
            contentTitle: errorData.content_title,
          };
        }
        return { success: false, error: "Error de acceso" };
      }
      return { success: true };
    } catch {
      return { success: false, error: "Error de red" };
    }
  }

  // Comportamiento original si no es navigateOnly
  const newWindow = window.open("", "_blank");

  if (newWindow) {
    newWindow.document.write(`
            <html>
                <head>
                    <title>Cargando PDF...</title>
                    <style>
                        body {
                            background-color: #1a1a1a;
                            color: #e5e5e5;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            font-family: Arial, sans-serif;
                            margin: 0;
                        }
                        .loader {
                            border: 4px solid #333;
                            border-top: 4px solid #e50914;
                            border-radius: 50%;
                            width: 40px;
                            height: 40px;
                            animation: spin 1s linear infinite;
                            margin-bottom: 20px;
                        }
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        .container {
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="loader" style="margin: 0 auto;"></div>
                        <p>Abriendo documento...</p>
                    </div>
                </body>
            </html>
        `);
  }

  try {
    const pdfUrl = getPdfServiceUrl(type, id);

    // Hacer la solicitud para obtener el PDF
    const response = await fetch(pdfUrl, {
      method: "GET",
      headers: {
        Accept: "application/pdf, application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
      },
    });

    // Manejo de errores
    if (!response.ok) {
      if (response.status === 403) {
        if (newWindow) newWindow.close();
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.message,
            code: errorData.code,
            isPremium: errorData.is_premium,
            userRole: errorData.user_role,
            contentTitle: errorData.content_title,
          };
        } catch {
          return {
            success: false,
            error: "Contenido no disponible",
            code: "ACCESS_DENIED",
          };
        }
      }

      if (newWindow) newWindow.close();
      if (response.status === 404) {
        return {
          success: false,
          error: "Archivo no encontrado",
          code: "FILE_NOT_FOUND",
        };
      }

      return {
        success: false,
        error: "Error al acceder al contenido",
        code: "ERROR",
      };
    }

    // Obtener el Blob del PDF
    const blob = await response.blob();

    // Crear URL temporal
    const blobUrl = window.URL.createObjectURL(blob);

    if (newWindow) {
      newWindow.location.href = blobUrl;
    } else {
      // Fallback if window failed to open (unlikely if called from click)
      window.open(blobUrl, "_blank");
    }

    // Limpiar la URL después de un tiempo
    // Note: tricky with new window, but we rely on browser handling
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);

    return { success: true };
  } catch (error) {
    if (newWindow) newWindow.close();
    console.error("Error opening PDF:", error);
    return { success: false, error: "Error al abrir el PDF" };
  }
};

/**
 * Descarga un PDF con detección de contenido premium
 *
 * @param {Object} options - Opciones para descargar el PDF
 * @param {Object} options.content - Objeto del contenido
 * @param {string} options.type - Tipo de contenido ('libro', 'manga', 'comic')
 * @param {number} options.id - ID del contenido
 * @param {string} options.title - Título del contenido
 * @returns {Promise<Object>} - {success: boolean, error?: string, code?: string, ...}
 */
export const downloadPDF = async (options) => {
  const { content, type, id, title } = options;

  if (!content && (!type || !id)) {
    console.warn("Invalid options for downloadPDF");
    return { success: false, error: "Opciones inválidas" };
  }

  try {
    const pdfUrl = getPdfServiceUrl(type, id);
    const fileName = title ? `${title}.pdf` : "documento.pdf";

    // Hacer la solicitud para obtener el PDF
    const response = await fetch(pdfUrl, {
      method: "GET",
      headers: {
        Accept: "application/pdf, application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
      },
    });

    // Manejo de errores
    if (!response.ok) {
      if (response.status === 403) {
        try {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.message,
            code: errorData.code,
            isPremium: errorData.is_premium,
            userRole: errorData.user_role,
            contentTitle: errorData.content_title,
          };
        } catch {
          return {
            success: false,
            error: "No tienes acceso a este contenido",
            code: "ACCESS_DENIED",
          };
        }
      }

      if (response.status === 404) {
        return {
          success: false,
          error: "Archivo no encontrado",
          code: "FILE_NOT_FOUND",
        };
      }

      return {
        success: false,
        error: "Error al descargar el contenido",
        code: "ERROR",
      };
    }

    // Obtener el Blob del PDF
    const blob = await response.blob();

    // Crear enlace temporal y descargar
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpiar la URL
    window.URL.revokeObjectURL(blobUrl);

    return { success: true };
  } catch (error) {
    console.error("Error downloading PDF:", error);
    return {
      success: false,
      error: "Error al descargar el PDF",
      code: "ERROR",
    };
  }
};

/**
 * Validates if a content object has a valid PDF file
 * @param {Object} content - The content object to validate
 * @returns {boolean} - Returns true if content has a valid PDF file
 */
export const hasPDF = (content) => {
  if (!content) return false;
  return !!(content.file || content.pdf || content.archivo);
};
