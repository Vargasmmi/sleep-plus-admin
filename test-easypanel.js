const axios = require('axios');

const EASYPANEL_URL = 'http://168.231.92.67:3000';
const API_TOKEN = 'c86df06feae92526658731f8fefb0c208bc00ff1d7538c6461a23fe0b9657a58';

async function testConnection() {
  console.log('🔍 Probando conexión con EasyPanel...\n');

  try {
    // Intentar acceder a la API
    const response = await axios.get(
      `${EASYPANEL_URL}/api/health`,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`
        },
        timeout: 5000
      }
    );
    
    console.log('✅ Conexión exitosa');
    console.log('Response:', response.data);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ No se puede conectar a EasyPanel');
      console.log('   Verifica que EasyPanel esté ejecutándose en', EASYPANEL_URL);
    } else if (error.response) {
      console.log('❌ Error de respuesta:', error.response.status);
      console.log('   Mensaje:', error.response.data);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testConnection();
