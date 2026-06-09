const bcrypt = require('bcrypt');

const generateHashes = async () => {
  const password1 = 'admin123';
  const password2 = '1234';
  
  try {
    const hash1 = await bcrypt.hash(password1, 10);
    const hash2 = await bcrypt.hash(password2, 10);
    
    console.log('HASHES GENERADOS:');
    console.log('================\n');
    console.log(`Password: "${password1}"`);
    console.log(`Hash: ${hash1}\n`);
    console.log(`Password: "${password2}"`);
    console.log(`Hash: ${hash2}\n`);
  } catch (error) {
    console.error('Error:', error);
  }
};

generateHashes();
