const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Cliente = db.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  telefone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  logradouro: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  numero: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  complemento: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  bairro: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  cidade: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  cep: {
    type: DataTypes.STRING(8),
    allowNull: true,
  },
  anotacoes: {
    type: DataTypes.STRING(255),
    allowNull: true,
  }
}, {
  tableName: 'Cliente',
});

module.exports = Cliente;
