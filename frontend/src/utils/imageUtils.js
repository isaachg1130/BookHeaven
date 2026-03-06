/**
 * Utility functions para manejar URLs de imágenes del storage del backend
 */

// Obtener la URL base de la API desde la configuración o variable de entorno
const getApiBaseUrl = () => {
    return import.meta.env.VITE_API_URL || '';
};

// Obtener la URL base sin /api
const getServerBaseUrl = () => {
    const apiUrl = getApiBaseUrl();
    return apiUrl.replace('/api', '');
};

/**
 * Construir la URL completa de una imagen en el storage
 * @param {string} imagePath - La ruta relativa de la imagen (ej: 'libros/imagen.jpg')
 * @returns {string} - La URL completa
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) {
        return 'https://via.placeholder.com/200x300?text=No+Image';
    }

    // Si ya es una URL completa, devolverla tal cual
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Si empieza con /storage, solo agregar el servidor base
    if (imagePath.startsWith('/storage')) {
        return getServerBaseUrl() + imagePath;
    }

    // Si es una ruta relativa, agregarle /storage
    return getServerBaseUrl() + '/storage/' + imagePath;
};

export default getImageUrl;
