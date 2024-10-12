const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Barbeiro = db.define('Barbeiro', {
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
  sobre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  imagem: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Barbeiro',
});


module.exports = Barbeiro;
