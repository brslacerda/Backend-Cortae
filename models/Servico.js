const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Servico = db.define('Servico', {
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
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  numJanelas: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: true,
  }
},{
  tableName: 'Servico',
});

module.exports = Servico;
