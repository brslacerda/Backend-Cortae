const { Op } = require("sequelize");
const HorarioAtendimento = require("../models/HorarioAtendimento");

const horarioAtendimentoController = {

  horarioBarbeiro: async (req, res) => {
    const { barbeiroId } = req.body;
    try {
      const horariosAtendimento = await HorarioAtendimento.findAll({
        where: {
          barbeiro_id: barbeiroId,
        }
      })
      res.status(200).json(horariosAtendimento);
    } catch {
      res.status(500).json({ message: 'Erro ao obter horarios de atendimento', error });
    }
  },
  cadastrarOuAtualizarHorariosBarbeiro: async (req, res) => {
    const { barbeiroId, horariosAtendimento } = req.body;

    try {
      const horariosExistentes = horariosAtendimento.filter(horarioAtendimento => horarioAtendimento.id);
      const novosHorarios = horariosAtendimento.filter(horarioAtendimento => !horarioAtendimento.id);

      const idsHorariosExistentes = horariosExistentes.map(horarioAtendimento => horarioAtendimento.id)

      const horariosARemover = await HorarioAtendimento.destroy({
        where:{
          id:{
            [Op.notIn]:idsHorariosExistentes
          },
          barbeiro_id:barbeiroId
        }
      })

      for (const horarioAtendimento of horariosExistentes) {
        await HorarioAtendimento.update(
          {
            ativo: horarioAtendimento.ativo,
            diaDaSemana: horarioAtendimento.diaDaSemana,
            horarioInicio: horarioAtendimento.horarioInicio,
            horarioFim: horarioAtendimento.horarioFim
          },
          {
            where: {
              id: horarioAtendimento.id
            }
          }
        );
      }

      for (const horarioAtendimento of novosHorarios) {
        await HorarioAtendimento.create({
          barbeiro_id: barbeiroId,
          diaDaSemana: horarioAtendimento.diaDaSemana,
          horarioInicio: horarioAtendimento.horarioInicio,
          horarioFim: horarioAtendimento.horarioFim,
          ativo: horarioAtendimento.ativo
        });
      }

      res.status(200).json({ message: 'Horários de atendimento atualizados com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao cadastrar ou atualizar horários' });
    }
  }
}
module.exports = horarioAtendimentoController;