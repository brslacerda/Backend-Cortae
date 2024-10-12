const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Barbeiro = require('./Barbeiro');
const Servico = require('./Servico');

const BarbeiroServico = db.define('BarbeiroServico', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
},{
  tableName: 'BarbeiroServico',
});

module.exports = BarbeiroServico;
