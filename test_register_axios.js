const axios = require('axios');

async function testRegisterWithAxios() {
    const timestamp = Math.floor(Date.now() / 1000);
    const testData = {
        name: 'Test Axios User',
        email: `test_axios_${timestamp}@example.com`,
        password: 'TestPassword123',
        password_confirmation: 'TestPassword123'
    };

    // Crear instancia de axios similar a la del frontend
    const client = axios.create({
        baseURL: 'http://localhost:8000/api',
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    try {
        console.log('═══════════════════════════════════════════');
        console.log('   TEST DE REGISTRO CON AXIOS (NODE)');
        console.log('═══════════════════════════════════════════');
        console.log('');
        console.log('Datos de prueba:');
        console.log(`  Email: ${testData.email}`);
        console.log(`  Nombre: ${testData.name}`);
        console.log('');
        console.log('Enviando POST a /auth/register...');
        console.log('');

        const response = await client.post('/auth/register', testData);

        console.log('✅ Respuesta recibida:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('');
        console.log(`Status: ${response.status}`);
        console.log('');
        console.log('═══════════════════════════════════════════');
    } catch (error) {
        console.log('❌ Error:');
        console.log(`Status Code: ${error.response?.status}`);
        console.log('');
        if (error.response?.data) {
            console.log('Response Body:');
            console.log(JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error:', error.message);
        }
        console.log('');
        console.log('═══════════════════════════════════════════');
    }
}

testRegisterWithAxios();
