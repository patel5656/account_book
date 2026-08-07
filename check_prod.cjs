const axios = require('axios');

async function main() {
  try {
    const res = await axios.post('https://amul-account-backend-production.up.railway.app/api/v1/auth/login', {
      email: 'swayambillbook@gmail.com',
      password: '123456'
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Failed with status:", err.response?.status);
    console.error("Response body:", err.response?.data);
  }
}

main();
