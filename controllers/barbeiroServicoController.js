const db = require('../config/db');
const Barbeiro = require('../models/Barbeiro');
const BarbeiroServico = require('../models/BarbeiroServico');
const Servico = require('../models/Servico');
const Usuario = require('../models/Usuario');
const { Op, where } = require('sequelize');

const barbeiroServicoController = {
  barbeiroServicos: async (req, res) => {
    const { barbeiroId } = req.body;
    try {
      const barbeirosServicos = await BarbeiroServico.findAll({
        where: {
          barbeiro_id: barbeiroId,
          ativo: true
        }, attributes: ['servico_id']
      });
      const servicoIds = barbeirosServicos.map(servico => servico.servico_id);

      const servicos = await Servico.findAll({
        where: {
          id: servicoIds
        },
        ativo: true
      });
      res.status(201).json(servicos);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar servicos que barbeiro executa' });
    }
  },
  cadastrarOuAtualizarBarbeiroServicos: async (req, res) => {
    const { barbeiroId, servicos } = req.body;
    try {
      const barbeirosServicosADesativar = await BarbeiroServico.findAll({
        where: {
          barbeiro_id: barbeiroId,
          servico_id: {
            [Op.notIn]: servicos
          },
          ativo: true
        }, attributes: ['servico_id']
      });

      const barbeirosServicosAAtivar = await BarbeiroServico.findAll({
        where: {
          barbeiro_id: barbeiroId,
          servico_id: {
            [Op.in]: servicos
          },
          ativo: false
        }, attributes: ['servico_id']
      });

      const servicosAManter = await BarbeiroServico.findAll({
        where: {
          barbeiro_id: barbeiroId,
          servico_id: {
            [Op.in]: servicos
          },
          ativo: true
        }, attributes: ['servico_id']
      });

      const barbeirosServicosADesativarId = barbeirosServicosADesativar.map(servico => servico.servico_id);
      const barbeirosServicosAAtivarId = barbeirosServicosAAtivar.map(servico => servico.servico_id);
      const barbeirosServicosAManterId = servicosAManter.map(servico => servico.servico_id);


      const barbeirosServicosACriarId = servicos.filter(servicoId =>
        !barbeirosServicosAAtivarId.includes(servicoId) &&
        !barbeirosServicosADesativarId.includes(servicoId) &&
        !barbeirosServicosAManterId.includes(servicoId)
      );

      if (barbeirosServicosACriarId.length > 0) {
        await BarbeiroServico.bulkCreate(
          barbeirosServicosACriarId.map(servicoId => ({
            barbeiro_id: barbeiroId,
            servico_id: servicoId,
            ativo: true
          }))
        );
      }

      if (barbeirosServicosADesativarId.length > 0) {
        await BarbeiroServico.update(
          { ativo: false },
          {
            where: {
              barbeiro_id: barbeiroId,
              servico_id: barbeirosServicosADesativarId
            }
          }
        );
      }

      if (barbeirosServicosAAtivarId.length > 0) {
        await BarbeiroServico.update(
          { ativo: true },
          {
            where: {
              barbeiro_id: barbeiroId,
              servico_id: barbeirosServicosAAtivarId
            }
          }
        );
      }

      console.log('criar', barbeirosServicosACriarId);
      console.log('desativar', barbeirosServicosADesativarId);
      console.log('ativar', barbeirosServicosAAtivarId);
      res.status(200).json({ message: 'Serviços atualizados com sucesso' });

    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar servicos que barbeiro executa' });
    }
  },
  servicosBarbeiros: async (req, res) => {
    const { servicoId } = req.body;
    try {
      const servicosBarbeiros = await BarbeiroServico.findAll({
        where: {
          servico_id: servicoId,
          ativo: true
        }, attributes: ['barbeiro_id']
      });
      const barbeirosIds = servicosBarbeiros.map(barbeiro => barbeiro.barbeiro_id);
      const barbeiros = await Barbeiro.findAll({
        where: {
          id: barbeirosIds
        },
        ativo: true
      });
      res.status(201).json(barbeiros);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar servicos que barbeiro executa' });
    }
  },
  cadastrarOuAtualizarServicoBarbeiro: async (req, res) => {
    const { servicoId, barbeiros } = req.body;
    try {
      const servicosBarbeiroADesativar = await BarbeiroServico.findAll({
        where: {
          servico_id: servicoId,
          barbeiro_id: {
            [Op.notIn]: barbeiros
          },
          ativo: true
        }, attributes: ['barbeiro_id']
      });

      const servicosBarbeiroAAtivar = await BarbeiroServico.findAll({
        where: {
          servico_id: servicoId,
          barbeiro_id: {
            [Op.in]: barbeiros
          },
          ativo: false
        }, attributes: ['barbeiro_id']
      });

      const servicosAManter = await BarbeiroServico.findAll({
        where: {
          servico_id: servicoId,
          barbeiro_id: {
            [Op.in]: barbeiros
          },
          ativo: true
        }, attributes: ['barbeiro_id']
      });

      const servicosBarbeiroADesativarId = servicosBarbeiroADesativar.map(barbeiro => barbeiro.barbeiro_id);
      const servicosBarbeiroAAtivarId = servicosBarbeiroAAtivar.map(barbeiro => barbeiro.barbeiro_id);
      const servicosBarbeiroAManterId = servicosAManter.map(barbeiro => barbeiro.barbeiro_id);


      const servicosBarbeiroACriarId = barbeiros.filter(barbeiroId =>
        !servicosBarbeiroAAtivarId.includes(barbeiroId) &&
        !servicosBarbeiroADesativarId.includes(barbeiroId) &&
        !servicosBarbeiroAManterId.includes(barbeiroId)
      );

      if (servicosBarbeiroACriarId.length > 0) {
        await BarbeiroServico.bulkCreate(
          servicosBarbeiroACriarId.map(barbeiroId => ({
            servico_id: servicoId,
            barbeiro_id: barbeiroId,
            ativo: true
          }))
        );
      }

      if (servicosBarbeiroADesativarId.length > 0) {
        await BarbeiroServico.update(
          { ativo: false },
          {
            where: {
              servico_id: servicoId,
              barbeiro_id: servicosBarbeiroADesativarId
            }
          }
        );
      }

      if (servicosBarbeiroAAtivarId.length > 0) {
        await BarbeiroServico.update(
          { ativo: true },
          {
            where: {
              servico_id: servicoId,
              barbeiro_id: servicosBarbeiroAAtivarId
            }
          }
        );
      }

      res.status(200).json({ message: 'Serviços atualizados com sucesso' });

    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar servicos que barbeiro executa' });
    }
  }
}
module.exports = barbeiroServicoController;