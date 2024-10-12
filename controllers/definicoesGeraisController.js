const DefinicoesGerais = require("../models/DefinicoesGerais");

const definicoesGerais = {

  tempoJanela: async (req, res) => {
    try {
      const tempoJanela = await DefinicoesGerais.findOne({
        attributes:['tempoJanela']
      })
      res.status(200).json(tempoJanela);
    } catch {
      res.status(500).json({ message: 'Erro ao obter agendamentos ativos', error });
    }
  }

}

module.exports = definicoesGerais;