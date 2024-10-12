const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Barbeiro = require('./Barbeiro');

const RestricaoHorario = db.define('RestricaoHorario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  inicio: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fim: {
    type: DataTypes.DATE,
    allowNull: false,
  }
},{
  tableName: 'RestricaoHorario',
});

module.exports = RestricaoHorario;
