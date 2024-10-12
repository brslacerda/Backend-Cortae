const { DataTypes } = require('sequelize');
const db = require('../config/db');
const Barbeiro = require('./Barbeiro');

const HorarioAtendimento = db.define('HorarioAtendimento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  diaDaSemana: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  horarioInicio: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  horarioFim: {
    type: DataTypes.TIME,
    allowNull: false,
  }
},{
  tableName: 'HorarioAtendimento',
});

module.exports = HorarioAtendimento;
