const { DataTypes } = require("sequelize");
const db = require("../config/db");

const DefinicoesGerais = db.define('DefinicoesGerais', {
    endereco:{
        type:DataTypes.STRING(50)
    },
    tempoJanela:{
        type:DataTypes.INTEGER
    }
},{
    tableName: 'DefinicoesGerais',
})

module.exports = DefinicoesGerais;