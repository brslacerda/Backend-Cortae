const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Agendamento = require('./Agendamento');
const Servico = require('./Servico');

const AgendamentoServico = db.define('AgendamentoServico', {
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
  tableName: 'AgendamentoServico',
});

module.exports = AgendamentoServico;
