const CryptoJS = require('crypto-js');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

const criptografia = {
  encriptar: async (req, res) => {
    const { dadosParaEncriptar } = req.body;
    try {
      const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(dadosParaEncriptar), secretKey).toString();
      res.status(200).json(encryptedData);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao encriptar os dados' });
    }
  },
  desencriptar: async (req, res) => {
    const { dadosLocais } = req.body;
    try {
      const bytes = CryptoJS.AES.decrypt(dadosLocais, secretKey);
      const dadosDesencriptados = bytes.toString(CryptoJS.enc.Utf8);
      res.status(200).json(dadosDesencriptados);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao desencriptar os dados' });
    }
  }
}

module.exports = criptografia;