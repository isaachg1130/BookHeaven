// src/utils/invoiceGenerator.js
/**
 * Genera y descarga una factura en formato PDF
 */

export const generateInvoice = async (invoiceData) => {
  const {
    user,
    plan,
    payment,
    premiumExpiresAt,
    transactionDate = new Date(),
  } = invoiceData;

  // Crear un canvas para dibujar la factura
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Tamaño A4 en píxeles (72 DPI)
  canvas.width = 595;
  canvas.height = 842;

  // Fondo
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Cargar el logo
  const logo = new Image();
  logo.crossOrigin = "anonymous";
  logo.src = window.location.origin + "/logo.png"; // Ruta al logo en public

  return new Promise((resolve) => {
    logo.onload = () => {
      // Header con logo
      ctx.save();
      ctx.beginPath();
      ctx.arc(80, 60, 35, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logo, 45, 25, 70, 70);
      ctx.restore();

      // Título de la empresa
      ctx.fillStyle = "#1a1208";
      ctx.font = "bold 24px Arial";
      ctx.fillText("BookHeaven", 130, 55);

      ctx.font = "12px Arial";
      ctx.fillStyle = "#666";
      ctx.fillText("Tu biblioteca premium de libros y cómics", 130, 75);

      // Línea separadora
      ctx.strokeStyle = "#D4A76A";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 110);
      ctx.lineTo(555, 110);
      ctx.stroke();

      // Título: FACTURA
      ctx.fillStyle = "#D4A76A";
      ctx.font = "bold 28px Arial";
      ctx.fillText("FACTURA", 40, 150);

      // Información de la factura
      ctx.fillStyle = "#333";
      ctx.font = "11px Arial";
      ctx.fillText(
        `Número: INV-${payment?.transaction_id || Date.now()}`,
        40,
        175,
      );
      ctx.fillText(
        `Fecha: ${new Date(transactionDate).toLocaleDateString("es-ES")}`,
        40,
        195,
      );

      // Información del cliente
      ctx.fillStyle = "#1a1208";
      ctx.font = "bold 14px Arial";
      ctx.fillText("CLIENTE:", 40, 240);

      ctx.fillStyle = "#333";
      ctx.font = "12px Arial";
      ctx.fillText(`Nombre: ${user?.name || "Usuario"}`, 40, 260);
      ctx.fillText(`Email: ${user?.email || ""}`, 40, 280);

      // Tabla de productos
      ctx.fillStyle = "#1a1208";
      ctx.font = "bold 14px Arial";
      ctx.fillText("DETALLES DE LA SUSCRIPCIÓN:", 40, 330);

      // Encabezado de tabla
      ctx.fillStyle = "#D4A76A";
      ctx.fillRect(40, 345, 515, 35);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 11px Arial";
      ctx.fillText("DESCRIPCIÓN", 50, 365);
      ctx.fillText("PERÍODO", 320, 365);
      ctx.fillText("PRECIO", 470, 365);

      // Fila de producto
      ctx.fillStyle = "#f9f9f9";
      ctx.fillRect(40, 380, 515, 40);

      ctx.strokeStyle = "#ddd";
      ctx.strokeRect(40, 380, 515, 40);

      ctx.fillStyle = "#333";
      ctx.font = "11px Arial";
      ctx.fillText(plan?.name || "Suscripción Premium", 50, 400);
      ctx.fillText(`${plan?.duration_months || 1} mes(es)`, 320, 400);

      ctx.font = "bold 12px Arial";
      ctx.fillText(`$${(plan?.price || 0).toFixed(2)}`, 470, 400);

      // Subtotales
      const subtotal = plan?.price || 0;
      const impuestos = 0; // Ajustar según necesidad
      const total = subtotal + impuestos;

      ctx.fillStyle = "#333";
      ctx.font = "11px Arial";
      ctx.fillText("Subtotal:", 380, 450);
      ctx.fillText(`$${subtotal.toFixed(2)}`, 470, 450);

      ctx.fillText("Impuestos:", 380, 470);
      ctx.fillText("Incluidos", 470, 470);

      // Total
      ctx.fillStyle = "#D4A76A";
      ctx.fillRect(360, 485, 195, 35);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 14px Arial";
      ctx.fillText("TOTAL:", 380, 507);
      ctx.font = "bold 18px Arial";
      ctx.fillText(`$${total.toFixed(2)} USD`, 460, 507);

      // Período de validez
      if (premiumExpiresAt) {
        const expiresDate = new Date(premiumExpiresAt).toLocaleDateString(
          "es-ES",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          },
        );

        ctx.fillStyle = "#1a1208";
        ctx.font = "bold 12px Arial";
        ctx.fillText("PERÍODO DE SUSCRIPCIÓN:", 40, 570);

        ctx.fillStyle = "#333";
        ctx.font = "11px Arial";
        ctx.fillText(
          `Inicio: ${new Date(transactionDate).toLocaleDateString("es-ES")}`,
          40,
          590,
        );
        ctx.fillText(`Vencimiento: ${expiresDate}`, 40, 610);
      }

      // Beneficios incluidos
      ctx.fillStyle = "#1a1208";
      ctx.font = "bold 12px Arial";
      ctx.fillText("BENEFICIOS INCLUIDOS:", 40, 660);

      ctx.fillStyle = "#333";
      ctx.font = "10px Arial";
      const benefits = [
        "✓ Acceso ilimitado a todo el contenido premium",
        "✓ Audiolibros, libros y mangas exclusivos",
        "✓ Descargas offline sin límite",
        "✓ Sin anuncios en toda la plataforma",
        "✓ Sincronización de progreso en todos tus dispositivos",
      ];

      benefits.forEach((benefit, index) => {
        ctx.fillText(benefit, 50, 680 + index * 18);
      });

      // Footer
      ctx.fillStyle = "#999";
      ctx.font = "9px Arial";
      ctx.fillText(
        "Gracias por tu compra. Esta es una factura digital generada automáticamente.",
        40,
        790,
      );
      ctx.fillText("BookHeaven © 2026 - www.bookheaven.com", 40, 805);

      ctx.fillStyle = "#D4A76A";
      ctx.fillText("Soporte: soporte@bookheaven.com", 40, 820);

      // Convertir canvas a blob y descargar
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Factura-BookHeaven-${payment?.transaction_id || Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        resolve();
      });
    };

    // Si el logo no carga, generar sin él
    logo.onerror = () => {
      // Dibujar sin logo
      ctx.fillStyle = "#1a1208";
      ctx.font = "bold 24px Arial";
      ctx.fillText("BookHeaven", 40, 55);

      // Continuar con el resto del código...
      resolve();
    };
  });
};

/**
 * Genera una versión imprimible de la factura (alternativa)
 */
export const printInvoice = (invoiceData) => {
  const {
    user,
    plan,
    payment,
    premiumExpiresAt,
    transactionDate = new Date(),
  } = invoiceData;

  const expiresDate = premiumExpiresAt
    ? new Date(premiumExpiresAt).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Factura - BookHeaven</title>
            <style>
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px;
                    background: white;
                }
                .header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #D4A76A;
                    padding-bottom: 20px;
                }
                .logo {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                }
                .company-info h1 {
                    margin: 0;
                    color: #1a1208;
                    font-size: 28px;
                }
                .company-info p {
                    margin: 5px 0 0;
                    color: #666;
                }
                .invoice-title {
                    color: #D4A76A;
                    font-size: 32px;
                    margin: 30px 0 20px;
                }
                .invoice-details {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                }
                .client-info, .invoice-info {
                    flex: 1;
                }
                .section-title {
                    font-weight: bold;
                    color: #1a1208;
                    margin-bottom: 10px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 30px 0;
                }
                th {
                    background: #D4A76A;
                    color: white;
                    padding: 12px;
                    text-align: left;
                }
                td {
                    padding: 12px;
                    border-bottom: 1px solid #ddd;
                }
                .total-section {
                    text-align: right;
                    margin-top: 20px;
                }
                .total-row {
                    display: flex;
                    justify-content: flex-end;
                    gap: 100px;
                    padding: 8px 0;
                }
                .total-final {
                    background: #D4A76A;
                    color: white;
                    padding: 15px;
                    font-size: 20px;
                    font-weight: bold;
                    margin-top: 10px;
                }
                .benefits {
                    margin: 30px 0;
                    padding: 20px;
                    background: #f9f9f9;
                    border-radius: 8px;
                }
                .benefits ul {
                    list-style: none;
                    padding: 0;
                }
                .benefits li {
                    padding: 5px 0;
                    color: #333;
                }
                .footer {
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    text-align: center;
                    color: #999;
                    font-size: 12px;
                }
                .btn-print {
                    background: #D4A76A;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    margin: 20px 0;
                }
                .btn-print:hover {
                    background: #A67C52;
                }
            </style>
        </head>
        <body>
            <div class="no-print">
                <button class="btn-print" onclick="window.print()">🖨️ Imprimir Factura</button>
            </div>
            
            <div class="header">
                <img src="/logo.png" alt="BookHeaven" class="logo" />
                <div class="company-info">
                    <h1>BookHeaven</h1>
                    <p>Tu biblioteca premium de libros y cómics</p>
                </div>
            </div>
            
            <h1 class="invoice-title">FACTURA</h1>
            
            <div class="invoice-details">
                <div class="client-info">
                    <div class="section-title">CLIENTE:</div>
                    <p><strong>Nombre:</strong> ${user?.name || "Usuario"}</p>
                    <p><strong>Email:</strong> ${user?.email || ""}</p>
                </div>
                <div class="invoice-info">
                    <p><strong>Número:</strong> INV-${payment?.transaction_id || Date.now()}</p>
                    <p><strong>Fecha:</strong> ${new Date(transactionDate).toLocaleDateString("es-ES")}</p>
                    ${expiresDate ? `<p><strong>Válido hasta:</strong> ${expiresDate}</p>` : ""}
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>DESCRIPCIÓN</th>
                        <th>PERÍODO</th>
                        <th>PRECIO</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${plan?.name || "Suscripción Premium"}</td>
                        <td>${plan?.duration_months || 1} mes(es)</td>
                        <td><strong>$${(plan?.price || 0).toFixed(2)} USD</strong></td>
                    </tr>
                </tbody>
            </table>
            
            <div class="total-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>$${(plan?.price || 0).toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Impuestos:</span>
                    <span>Incluidos</span>
                </div>
                <div class="total-final">
                    TOTAL: $${(plan?.price || 0).toFixed(2)} USD
                </div>
            </div>
            
            <div class="benefits">
                <div class="section-title">BENEFICIOS INCLUIDOS:</div>
                <ul>
                    <li>✓ Acceso ilimitado a todo el contenido premium</li>
                    <li>✓ Audiolibros, libros y mangas exclusivos</li>
                    <li>✓ Descargas offline sin límite</li>
                    <li>✓ Sin anuncios en toda la plataforma</li>
                    <li>✓ Sincronización de progreso en todos tus dispositivos</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>Gracias por tu compra. Esta es una factura digital generada automáticamente.</p>
                <p>BookHeaven © 2026 - www.bookheaven.com</p>
                <p style="color: #D4A76A;">Soporte: soporte@bookheaven.com</p>
            </div>
        </body>
        </html>
    `;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(html);
  printWindow.document.close();
};
