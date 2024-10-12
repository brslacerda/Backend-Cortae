const { Op } = require("sequelize");
const RestricaoHorario = require("../models/RestricaoHorario");

const restricaoHorarioController = {
  restricoesHorarioBarbeiro: async (req, res) => {
    const { barbeiroId } = req.body;
    try {
      const restricoesHorariosAtendimento = await RestricaoHorario.findAll({
        where: {
          barbeiro_id: barbeiroId,
        }
      })
      res.status(200).json(restricoesHorariosAtendimento);
    } catch {
      res.status(500).json({ message: 'Erro ao obter restricoes de horario ', error });
    }
  },
  cadastrarOuAtualizarRestricoesHorarioBarbeiro: async (req, res) => {
    const { barbeiroId, restricoesHorarios } = req.body;
    try {

      const restricoesExistentes = restricoesHorarios.filter(restricaoHorario => restricaoHorario.id);
      const novasRestricoes = restricoesHorarios.filter(restricaoHorario => !restricaoHorario.id);
      const idsRestricoesExistentes = restricoesExistentes.map(restricaoHorario => restricaoHorario.id)

      const restricoesARemover = await RestricaoHorario.destroy({
        where: {
          id: {
            [Op.notIn]: idsRestricoesExistentes
          },
          barbeiro_id: barbeiroId
        }
      });

      for (const restricaoHorario of restricoesExistentes) {
        const atualizados = await RestricaoHorario.update(
          {
            ativo: restricaoHorario.ativo,
            inicio: restricaoHorario.inicio,
            fim: restricaoHorario.fim,
          },
          {
            where: {
              id: restricaoHorario.id
            }
          }
        );
      }


      for (const restricaoHorario of novasRestricoes) {
        await RestricaoHorario.create({
          barbeiro_id: barbeiroId,
          inicio: restricaoHorario.inicio,
          fim: restricaoHorario.fim,
          ativo: restricaoHorario.ativo
        });
      }

      res.status(200).json({ message: 'Restriçoes de Horário atualizada com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao cadastrar ou atualizar restrições de horários' });
    }
  }
}

module.exports = restricaoHorarioController;