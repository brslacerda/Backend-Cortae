const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Cliente = require('./Cliente');
const Barbeiro = require('./Barbeiro');

const Agendamento = db.define('Agendamento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  dataAgendada: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  observacoes: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'Agendamento',
});

module.exports = Agendamento;
