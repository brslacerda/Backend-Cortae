const { where, Op } = require("sequelize");
const Agendamento = require("../models/Agendamento");
const AgendamentoServico = require("../models/AgendamentoServico");
const Barbeiro = require("../models/Barbeiro");
const Cliente = require("../models/Cliente");
const DefinicoesGerais = require("../models/DefinicoesGerais");
const Servico = require("../models/Servico");
const HorarioAtendimento = require("../models/HorarioAtendimento");
const RestricaoHorario = require("../models/RestricaoHorario");
const db = require("../config/db");
const { enviarEmailAgendamentoConfirmado, enviarEmailAgendamentoNegado } = require("../config/mail");
const Usuario = require("../models/Usuario");
const moment = require('moment');

const agendamentoController = {
  agendamentosAtivos: async (req, res) => {
    try {
      const agendamentosAtivos = await Agendamento.findAll({
        where: {
          ativo: true
        }
      })
      res.status(200).json(agendamentosAtivos);
    } catch {
      res.status(500).json({ message: 'Erro ao obter agendamentos ativos', error });
    }
  },
  duracaoAgendamento: async (req, res) => {
    const { idAgendamento } = req.body;

    try {
      const agendamentoServicos = await AgendamentoServico.findAll({
        attributes: ['servico_id'],
        where: {
          agendamento_id: Array.isArray(idAgendamento) ? idAgendamento : [idAgendamento]
        }
      });


      const definicoes = await DefinicoesGerais.findOne({
        attributes: ['tempoJanela']
      });


      const tempoJanela = definicoes.tempoJanela;

      const servicoIds = agendamentoServicos.map(as => as.servico_id);

      const servicos = await Servico.findAll({
        attributes: ['numJanelas'],
        where: {
          id: servicoIds
        }
      });

      const tempoTotal = servicos.reduce((total, servico) => total + (servico.numJanelas * tempoJanela), 0);

      res.status(200).json({ tempoTotal });
    } catch (error) {
      console.error('Erro ao obter a duração do agendamento:', error);
      res.status(500).json({ message: 'Erro ao obter a duração do agendamento', error });
    }
  },
  buscaAgendamentoId: async (req, res) => {
    const { agendamentoId } = req.body
    try {
      const agendamentoRetorno = await Agendamento.findOne({
        where: {
          id: agendamentoId
        }
      });

      const clienteId = agendamentoRetorno.cliente_id;
      const barbeiroId = agendamentoRetorno.barbeiro_id;

      const clienteAgendamento = await Cliente.findOne({
        where: {
          id: clienteId
        }
      });

      const barbeiroAgendamento = await Barbeiro.findOne({
        where: {
          id: barbeiroId
        }
      });

      const agendamentoServicos = await AgendamentoServico.findAll({
        where: {
          agendamento_id: agendamentoId
        }
      });

      const dataAgendamento = agendamentoRetorno.dataAgendada;

      const servicoIds = agendamentoServicos.map(agendamentoServico => agendamentoServico.servico_id);

      const servicosAgendados = await Servico.findAll({
        where: {
          id: servicoIds
        }
      });

      res.status(201).json({
        data: dataAgendamento,
        cliente: clienteAgendamento,
        barbeiro: barbeiroAgendamento,
        servicos: servicosAgendados
      })
    } catch (error) {
      res.status(500);
    }
  },
  buscaAgendamentoClienteId: async (req, res) => {
    const { usuarioId } = req.body
    try {
      const cliente = await Cliente.findOne({
        where: {
          usuarioId: usuarioId
        }
      })
      const agendamentoRetorno = await Agendamento.findAll({
        where: {
          cliente_id: cliente.id
        }
      });

      res.status(201).json({
        agendamentoRetorno
      })
    } catch (error) {
      res.status(500);
    }
  },
  horariosDisponiveis: async (req, res) => {
    const { barbeiroSelecionado, diaSelecionado, servicosSelecionados } = req.body;

    try {
      const data = new Date(diaSelecionado);
      const diaDaSemana = data.getDay();

      const restricoes = await RestricaoHorario.findAll({
        where: {
          barbeiro_id: barbeiroSelecionado,
          ativo: true
        }
      });

      const inicioDia = new Date(diaSelecionado + 'T00:00:00');
      const fimDoDia = new Date(diaSelecionado + 'T23:59:59');

      for (const restricao of restricoes) {
        const inicioRestricao = new Date(restricao.inicio);
        const fimRestricao = new Date(restricao.fim);

        if (inicioRestricao <= fimDoDia && fimRestricao >= inicioDia) {
          return res.status(200).json([]);
        }
      }

      const numJanelasNecessarias = await Servico.sum('numJanelas', {
        where: { id: servicosSelecionados }
      });

      const barbeiroHorarioTrabalho = await HorarioAtendimento.findAll({
        where: {
          diaDaSemana: diaDaSemana,
          barbeiro_id: barbeiroSelecionado,
          ativo: true
        },
        attributes: ['horarioInicio', 'horarioFim']
      });

      const definicoes = await DefinicoesGerais.findOne({
        attributes: ['tempoJanela']
      });
      const tempoJanela = definicoes.tempoJanela;

      const converterParaMinutos = (horario) => {
        const [horas, minutos] = horario.split(':').map(Number);
        return horas * 60 + minutos;
      };

      const converterParaHorario = (minutos) => {
        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;
        return `${horas.toString().padStart(2, '0')}:${minutosRestantes.toString().padStart(2, '0')}`;
      };

      let todosHorariosPossiveis = [];

      barbeiroHorarioTrabalho.forEach((horario) => {
        const inicioEmMinutos = converterParaMinutos(horario.horarioInicio);
        const fimEmMinutos = converterParaMinutos(horario.horarioFim);

        for (let minutos = inicioEmMinutos; minutos + tempoJanela <= fimEmMinutos; minutos += tempoJanela) {
          todosHorariosPossiveis.push(converterParaHorario(minutos));
        }
      });

      const agendamentosParaODia = await Agendamento.findAll({
        where: {
          barbeiro_id: barbeiroSelecionado,
          dataAgendada: {
            [Op.between]: [inicioDia, fimDoDia]
          },
          status: {
            [Op.in]: [1, 2, 5, 6]
          }
        }
      });

      const gerarHorariosOcupados = (inicio, totalJanelas, duracaoJanela) => {
        const horarios = [];
        let horaAtual = new Date(inicio);

        for (let i = 0; i < totalJanelas; i++) {
          horarios.push(horaAtual.toTimeString().split(' ')[0].substring(0, 5));
          horaAtual.setMinutes(horaAtual.getMinutes() + duracaoJanela);
        }

        return horarios;
      };

      let horariosOcupados = [];

      for (const agendamento of agendamentosParaODia) {
        const agendamentoServicos = await AgendamentoServico.findAll({
          where: { agendamento_id: agendamento.id }
        });

        let totalJanelas = 0;

        for (const agendamentoServico of agendamentoServicos) {
          const servico = await Servico.findOne({ where: { id: agendamentoServico.servico_id } });
          totalJanelas += servico.numJanelas;
        }

        const horarios = gerarHorariosOcupados(agendamento.dataAgendada, totalJanelas, tempoJanela);
        horariosOcupados = horariosOcupados.concat(horarios);
      }

      const horariosDisponiveis = todosHorariosPossiveis.filter(horario => !horariosOcupados.includes(horario));

      const filtrarHorariosComJanelasSuficientes = (horariosDisponiveis, numJanelasNecessarias, tempoJanela) => {
        let horariosValidos = [];

        for (let i = 0; i <= horariosDisponiveis.length - numJanelasNecessarias; i++) {
          let horarioInicial = horariosDisponiveis[i];
          let janelasConsecutivasDisponiveis = true;

          for (let j = 1; j < numJanelasNecessarias; j++) {
            const horarioAtualEmMinutos = converterParaMinutos(horarioInicial);
            const proximoHorarioEsperado = converterParaHorario(horarioAtualEmMinutos + (tempoJanela * j));

            if (horariosDisponiveis[i + j] !== proximoHorarioEsperado) {
              janelasConsecutivasDisponiveis = false;
              break;
            }
          }

          if (janelasConsecutivasDisponiveis) {
            horariosValidos.push(horarioInicial);
          }
        }

        return horariosValidos;
      };

      const horariosDisponiveisParaEsteAgendamento = filtrarHorariosComJanelasSuficientes(horariosDisponiveis, numJanelasNecessarias, tempoJanela);

      res.status(201).json(horariosDisponiveisParaEsteAgendamento);
    } catch (error) {
      console.error('Erro ao obter horários disponíveis:', error);
      res.status(500).send('Erro no servidor');
    }
  },
  cadastroAgendamento: async (req, res) => {
    const { clienteSelecionado, barbeiroSelecionado, servicosSelecionados, dataAgendamento, status } = req.body;
    const t = await db.transaction();
    const moment = require('moment-timezone');

    try {
      const precoAgendamento = await Servico.sum('preco', {
        where: {
          id: servicosSelecionados
        }
      });

      const dataAgendada = moment(dataAgendamento).tz('UTC').format('YYYY-MM-DD HH:mm:ss');

      const criacaoAgendamento = await Agendamento.create({
        status: status,
        dataAgendada: dataAgendada,
        barbeiro_id: barbeiroSelecionado,
        cliente_id: clienteSelecionado,
        preco: precoAgendamento
      }, { transaction: t });

      const agendamentoServicos = await AgendamentoServico.bulkCreate(
        servicosSelecionados.map((agendamentoServico) => ({
          agendamento_id: criacaoAgendamento.id,
          servico_id: agendamentoServico,
        })),
        { transaction: t }
      );

      await t.commit();
      res.status(201).json('Agendamento cadastrado com sucesso');
    } catch (error) {
      res.status(500).json({ error: 'Erro ao cadastrar agendamento' });
      await t.rollback();
    }
  },
  agendamentosPendentes: async (req, res) => {
    try {
      const agendamentosPendentes = await Agendamento.findAll({
        where: {
          ativo: true,
          status: 1
        }
      });
      const barbeiroIds = agendamentosPendentes.map(agendamento => agendamento.barbeiro_id);
      const clienteIds = agendamentosPendentes.map(agendamento => agendamento.cliente_id);

      const barbeirosAgendamento = await Barbeiro.findAll({
        where: {
          id: barbeiroIds
        }
      });
      const clientesAgendamentos = await Cliente.findAll({
        where: {
          id: clienteIds
        }
      });
      res.status(200).json({ pendentes: agendamentosPendentes, barbeiros: barbeirosAgendamento, clientes: clientesAgendamentos });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter agendamentos pendentes' });
    }
  },
  agendamentosBarbeirosClientes: async (req, res) => {
    try {
      const agendamentos = await Agendamento.findAll({
        where: {
          ativo: true
        }
      });
      const barbeiroIds = agendamentos.map(agendamento => agendamento.barbeiro_id);
      const clienteIds = agendamentos.map(agendamento => agendamento.cliente_id);

      const barbeirosAgendamento = await Barbeiro.findAll({
        where: {
          id: barbeiroIds
        }
      });
      const clientesAgendamentos = await Cliente.findAll({
        where: {
          id: clienteIds
        }
      });
      res.status(200).json({ todos: agendamentos, barbeiros: barbeirosAgendamento, clientes: clientesAgendamentos });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter agendamentos pendentes' });
    }
  },
  aprovarOuNegarAgendamento: async (req, res) => {
    const { agendamentoId, status } = req.body
    try {
      agendamentoAAprovar = await Agendamento.update({ status: status }, {
        where: {
          id: agendamentoId
        }
      });
      const agendamentoAtualizado = await Agendamento.findOne({
        where: {
          id: agendamentoId
        }
      });
      const idCliente = agendamentoAtualizado.cliente_id;
      const cliente = await Cliente.findOne({
        where: {
          id: idCliente
        }
      });
      const idUsuario = cliente.usuarioId;

      const usuario = await Usuario.findOne({
        where: {
          id: idUsuario
        }
      });
      const agendamentoServicos = await AgendamentoServico.findAll({
        where: {
          agendamento_id: agendamentoId
        }
      })
      const idsServicos = agendamentoServicos.map(as => as.servico_id);
      const servicos = await Servico.findAll({
        where: {
          id: idsServicos
        }
      })
      const nomesServicos = servicos.map(servicos => servicos.nome);
      const dataAgendada = moment(agendamentoAtualizado.dataAgendada);
      const dataFormatada = dataAgendada.format('DD/MM/YYYY HH:mm:ss');
      if (status === 2) {
        enviarEmailAgendamentoConfirmado(usuario.email, cliente.nome, dataFormatada, nomesServicos)
      }
      if (status === 4) {
        enviarEmailAgendamentoNegado(usuario.email, cliente.nome, dataFormatada, nomesServicos)
      }
      res.status(200).json({ message: 'Agendamento Atualizado' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao aprovar agendamento' });
    }
  },
  infosAgendamento: async (req, res) => {
    const { agendamentoId } = req.body
    try {
      const agendamento = await Agendamento.findAll({
        where: {
          id: agendamentoId,
          ativo: true
        }
      });
      const barbeiroId = agendamento.map(agendamento => agendamento.barbeiro_id);
      const clienteId = agendamento.map(agendamento => agendamento.cliente_id);

      const barbeiroAgendamento = await Barbeiro.findAll({
        where: {
          id: barbeiroId
        }
      });
      const clienteAgendamento = await Cliente.findAll({
        where: {
          id: clienteId
        }
      });
      const agendamentoServicos = await AgendamentoServico.findAll({
        where: {
          agendamento_id: agendamentoId
        }
      });
      const servicosId = agendamentoServicos.map(agendamentoServico => agendamentoServico.servico_id);

      const servicosAgendamento = await Servico.findAll({
        where: {
          id: servicosId
        }
      });
      res.status(200).json({ agendamento: agendamento, barbeiro: barbeiroAgendamento, cliente: clienteAgendamento, servicos: servicosAgendamento });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter agendamentos' });
    }
  },
  horariosDisponiveisEdicao: async (req, res) => {
    const { barbeiroSelecionado, diaSelecionado, servicosSelecionados, agendamentoId } = req.body;

    try {
      const data = new Date(diaSelecionado);
      if (isNaN(data.getTime())) {
        return res.status(400).send('Data fornecida é inválida');
      }
      const diaDaSemana = data.getDay();

      const numJanelasNecessarias = await Servico.sum('numJanelas', {
        where: { id: servicosSelecionados }
      });

      const barbeiroHorarioTrabalho = await HorarioAtendimento.findAll({
        where: {
          diaDaSemana: diaDaSemana,
          barbeiro_id: barbeiroSelecionado,
          ativo: true
        },
        attributes: ['horarioInicio', 'horarioFim']
      });

      const definicoes = await DefinicoesGerais.findOne({
        attributes: ['tempoJanela']
      });
      const tempoJanela = definicoes.tempoJanela;

      const converterParaMinutos = (horario) => {
        const [horas, minutos] = horario.split(':').map(Number);
        return horas * 60 + minutos;
      };

      const converterParaHorario = (minutos) => {
        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;
        return `${horas.toString().padStart(2, '0')}:${minutosRestantes.toString().padStart(2, '0')}`;
      };

      let todosHorariosPossiveis = [];

      barbeiroHorarioTrabalho.forEach((horario) => {
        const inicioEmMinutos = converterParaMinutos(horario.horarioInicio);
        const fimEmMinutos = converterParaMinutos(horario.horarioFim);

        for (let minutos = inicioEmMinutos; minutos + tempoJanela <= fimEmMinutos; minutos += tempoJanela) {
          todosHorariosPossiveis.push(converterParaHorario(minutos));
        }
      });

      const inicioDia = new Date(diaSelecionado + 'T00:00:00');
      const fimDoDia = new Date(diaSelecionado + 'T23:59:59');

      const agendamentosParaODia = await Agendamento.findAll({
        where: {
          id: {
            [Op.not]: agendamentoId,
          },
          barbeiro_id: barbeiroSelecionado,
          dataAgendada: {
            [Op.between]: [inicioDia, fimDoDia]
          },
          status: {
            [Op.in]: [1, 2, 5, 6]
          }
        }
      });

      const gerarHorariosOcupados = (inicio, totalJanelas, duracaoJanela) => {
        const horarios = [];
        let horaAtual = new Date(inicio);

        for (let i = 0; i < totalJanelas; i++) {
          horarios.push(horaAtual.toTimeString().split(' ')[0].substring(0, 5));
          horaAtual.setMinutes(horaAtual.getMinutes() + duracaoJanela);
        }

        return horarios;
      };

      let horariosOcupados = [];

      for (const agendamento of agendamentosParaODia) {
        const agendamentoServicos = await AgendamentoServico.findAll({
          where: { agendamento_id: agendamento.id }
        });

        let totalJanelas = 0;

        for (const agendamentoServico of agendamentoServicos) {
          const servico = await Servico.findOne({ where: { id: agendamentoServico.servico_id } });
          totalJanelas += servico.numJanelas;
        }

        const horarios = gerarHorariosOcupados(agendamento.dataAgendada, totalJanelas, tempoJanela);
        horariosOcupados = horariosOcupados.concat(horarios);
      }

      const horariosDisponiveis = todosHorariosPossiveis.filter(horario => !horariosOcupados.includes(horario));

      const filtrarHorariosComJanelasSuficientes = (horariosDisponiveis, numJanelasNecessarias, tempoJanela) => {
        let horariosValidos = [];

        for (let i = 0; i <= horariosDisponiveis.length - numJanelasNecessarias; i++) {
          let horarioInicial = horariosDisponiveis[i];
          let janelasConsecutivasDisponiveis = true;

          for (let j = 1; j < numJanelasNecessarias; j++) {
            const horarioAtualEmMinutos = converterParaMinutos(horarioInicial);
            const proximoHorarioEsperado = converterParaHorario(horarioAtualEmMinutos + (tempoJanela * j));

            if (horariosDisponiveis[i + j] !== proximoHorarioEsperado) {
              janelasConsecutivasDisponiveis = false;
              break;
            }
          }

          if (janelasConsecutivasDisponiveis) {
            horariosValidos.push(horarioInicial);
          }
        }

        return horariosValidos;
      };

      const horariosDisponiveisParaEsteAgendamento = filtrarHorariosComJanelasSuficientes(horariosDisponiveis, numJanelasNecessarias, tempoJanela);

      // console.log('Número de janelas necessárias:', numJanelasNecessarias);
      // console.log('diaSelecionado', diaSelecionado);
      // console.log('diaSelecionado (dia da semana):', diaDaSemana);
      // console.log('servicosSelecionados:', servicosSelecionados);
      // console.log('Horário de trabalho do barbeiro:', barbeiroHorarioTrabalho);
      // console.log('Tempo de cada janela (em minutos):', tempoJanela);
      // console.log('Todos os horários possíveis:', todosHorariosPossiveis);
      // console.log('Agendamentos no mesmo dia:', agendamentosParaODia);
      // console.log('Horarios Disponiveis:', horariosDisponiveis);
      // console.log('Horários com janelas suficientes:', horariosDisponiveisParaEsteAgendamento);

      res.status(201).json(horariosDisponiveisParaEsteAgendamento);
    } catch (error) {
      console.error('Erro ao obter horários disponíveis:', error);
      res.status(500).send('Erro no servidor');
    }
  },
  atualizarAgendamento: async (req, res) => {
    const { clienteSelecionado, barbeiroSelecionado, servicosSelecionados, dataAgendamento, agendamentoId } = req.body;
    console.log(servicosSelecionados);
    const t = await db.transaction();
    const moment = require('moment-timezone');

    console.log(clienteSelecionado, barbeiroSelecionado, servicosSelecionados, dataAgendamento, agendamentoId);
    try {
      const updateData = {}
      const agendamentoASerEditado = await Agendamento.findOne({
        where: {
          id: agendamentoId
        }
      });
      const agendamentosServicosASeremEditados = await AgendamentoServico.findAll({
        where: {
          agendamento_id: agendamentoId
        }
      });
      const idsAgendamentosServicosASeremEditados = agendamentosServicosASeremEditados.map(as => as.servico_id);
      const barbeiroId = agendamentoASerEditado.barbeiro_id;
      const dataASerEditada = agendamentoASerEditado.dataAgendada;
      const dataASerEditadaFormatada = moment(dataASerEditada).format('YYYY-MM-DD HH:mm:ss');
      const novaDataAgendamento = moment(dataAgendamento).tz('UTC').format('YYYY-MM-DD HH:mm:ss');

      if (dataASerEditadaFormatada !== novaDataAgendamento) {
        updateData.dataAgendada = novaDataAgendamento;
      }
      if (idsAgendamentosServicosASeremEditados !== servicosSelecionados) {
        const asASeremDeletados = idsAgendamentosServicosASeremEditados.filter(id => !servicosSelecionados.includes(id));
        const asASeremCriados = servicosSelecionados.filter(id => !idsAgendamentosServicosASeremEditados.includes(id));
        console.log(servicosSelecionados, asASeremCriados, asASeremDeletados)
        if (asASeremCriados.length > 0) {
          const novosAS = await AgendamentoServico.bulkCreate(
            asASeremCriados.map((servico) => ({
              agendamento_id: agendamentoId,
              servico_id: servico,
            }))
          )
        }
        if (asASeremDeletados.length > 0) {
          const deletados = await AgendamentoServico.destroy({
            where: {
              agendamento_id: agendamentoId,
              servico_id: asASeremDeletados
            }
          });
        }
      }

      if (barbeiroId !== barbeiroSelecionado) {
        updateData.barbeiro_id = barbeiroSelecionado;
      }

      const agendamentoPosDeleteCreate = await AgendamentoServico.findAll({
        where: {
          agendamento_id: agendamentoId
        }
      })
      const idsServicosAgendamento = agendamentoPosDeleteCreate.map(as => as.servico_id);

      const valorServicosAgendamento = await Servico.sum('preco', {
        where: {
          id: idsServicosAgendamento
        }
      })
      updateData.preco = valorServicosAgendamento;

      const agendamentoAtualizado = await Agendamento.update(updateData, {
        where: {
          id: agendamentoId
        }
      })

      res.status(200).json('criado com sucesso');
      console.log(updateData);
    } catch (error) {
      res.status(500).json('criado com sucesso');
    }
  }
}



module.exports = agendamentoController;