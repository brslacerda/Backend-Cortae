const { DataTypes } = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const Barbeiro = require('./Barbeiro');
const Cliente = require('./Cliente');


const Usuario = db.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // username: {
  //   type: DataTypes.STRING(50),
  //   allowNull: false,
  //   unique: true
  // },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  funcao: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  tokenAutenticacao:{
    type: DataTypes.STRING,
    allowNull:true
  }
}, {
  tableName: 'Usuario',
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.senha) {
        const salt = await bcrypt.genSalt(10);
        usuario.senha = await bcrypt.hash(usuario.senha, salt);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.senha) {
        const salt = await bcrypt.genSalt(10);
        usuario.senha = await bcrypt.hash(usuario.senha, salt);
      }
    }
  }
});

Usuario.prototype.validPassword = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};


module.exports = Usuario;
