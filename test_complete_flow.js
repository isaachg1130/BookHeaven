const axios = require('axios');

// Simulación del flujo de la aplicación DESPUÉS de nuestros cambios:
// 1. RegisterModal recibe registerFunction desde App
// 2. RegisterModal.handleSubmit() llama registerFunction(formData)
// 3. App.handleRegister() llama register(data) del contexto
// 4. AuthContext.register() llama authAPI.register(data)
// 5. authAPI.register() usa axios para hacer POST a /auth/register

async function simulateCompleteFlow() {
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Datos que enviaría RegisterModal
    const formData = {
        name: 'Complete Flow Test',
        email: `complete_flow_${timestamp}@example.com`,
        password: 'CompleteFlowPassword123',
        password_confirmation: 'CompleteFlowPassword123'
    };

    // Simulación del client siendo usado por authAPI
    const client = axios.create({
        baseURL: 'http://localhost:8000/api',
        timeout: 30000
    });

    // Interceptor similar al del frontend
    client.interceptors.request.use((config) => {
        config.headers['Content-Type'] = 'application/json';
        config.headers['Accept'] = 'application/json';
        return config;
    });

    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('   SIMULACION DEL FLUJO COMPLETO DE REGISTRO (POST-FIX)');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Flujo:');
    console.log('  RegisterModal.handleSubmit()');
    console.log('    -> registerFunction(formData)');
    console.log('      -> App.handleRegister(data)');
    console.log('        -> AuthContext.register()');
    console.log('          -> authAPI.register()');
    console.log('            -> axios.post("/auth/register")');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('');

    try {
        console.log('Datos enviados:');
        console.log(JSON.stringify(formData, null, 2));
        console.log('');
        console.log('Enviando POST /auth/register...');
        console.log('');

        // Esta es la llamada que hace authAPI.register(formData)
        const response = await client.post('/auth/register', formData);

        console.log('✅ EXITO - Respuesta 201');
        console.log('');
        console.log('Respuesta recibida:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('');
        console.log('Acciones que hace AuthContext después:');
        console.log('  1. localStorage.setItem("auth_token", token)');
        console.log('  2. setToken(newToken)');
        console.log('  3. setUser(newUser)');
        console.log('  4. return response.data');
        console.log('');
        console.log('Acciones que hace App.handleRegister después:');
        console.log('  1. setShowRegisterModal(false)');
        console.log('  2. addToast("¡Cuenta creada exitosamente!", "success")');
        console.log('');
        console.log('Acciones que hace RegisterModal después:');
        console.log('  1. onClose() - cierra el modal');
        console.log('');
        console.log('═══════════════════════════════════════════════════════════════════');
        console.log('✅ RESULTADO: Registro completado exitosamente SIN ERRORES 422');
        console.log('═══════════════════════════════════════════════════════════════════');
    } catch (error) {
        console.log('❌ ERROR');
        console.log('');
        console.log(`Status Code: ${error.response?.status}`);
        console.log('');
        if (error.response?.data) {
            console.log('Response Body:');
            console.log(JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error Message:', error.message);
        }
        console.log('');
        console.log('═══════════════════════════════════════════════════════════════════');
    }
}

simulateCompleteFlow();
