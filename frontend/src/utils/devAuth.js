/**
 * Utility para auto-login en desarrollo.
 * Evita la fatiga de loguearse manualmente tras cada cambio en el código.
 */
export const setupDevAuth = async () => {
    // 1. Verificación estricta de entorno
    const isDev = import.meta.env?.DEV;
    if (!isDev) return;

    // 2. Evitar re-ejecución si ya estamos autenticados
    const existingToken = localStorage.getItem('auth_token');
    if (existingToken) {
        // Opcional: Validar si el token es un string real y no "undefined" o "null"
        if (existingToken !== 'undefined' && existingToken !== 'null') {
            return;
        }
        localStorage.removeItem('auth_token'); // Limpiar basura si existe
    }

    // 3. Evitar bucles infinitos de intentos fallidos usando un flag temporal
    if (sessionStorage.getItem('dev_auth_failed')) {
        console.warn('⚠️ Dev login saltado para evitar bucle de errores. Borra sessionStorage para reintentar.');
        return;
    }

    try {
        console.log('🔐 [Dev Mode] Intentando auto-login...');
        
        // Ajusta la URL a tu host base si es necesario (ej: http://localhost:8000)
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                email: 'kristofercanotaborda@gmail.com',
                password: 'admin123',
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            sessionStorage.setItem('dev_auth_failed', 'true');
            throw new Error(`Status ${response.status}: ${result.message || 'Credenciales inválidas'}`);
        }

        // 4. Mapeo flexible de la respuesta (ajusta según la estructura de tu API)
        const token = result.data?.token || result.token || result.access_token;
        const user = result.data?.user || result.user;

        if (token) {
            localStorage.setItem('auth_token', token);
            if (user) localStorage.setItem('user', JSON.stringify(user));
            
            console.log('✅ Dev auth exitoso. Recargando aplicación...');
            
            // Usamos un pequeño delay para que el log sea visible antes de la recarga
            setTimeout(() => window.location.reload(), 500);
        } else {
            throw new Error('La API no devolvió un token válido en la respuesta.');
        }

    } catch (error) {
        sessionStorage.setItem('dev_auth_failed', 'true');
        console.error('❌ Error en el setup de Dev Auth:', error.message);
    }
};