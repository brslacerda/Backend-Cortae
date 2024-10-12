const Barbeiro = require("../models/Barbeiro");
const BarbeiroServico = require("../models/BarbeiroServico");
const Cliente = require("../models/Cliente");
const DefinicoesGerais = require("../models/DefinicoesGerais");
const HorarioAtendimento = require("../models/HorarioAtendimento");
const Servico = require("../models/Servico");
const Usuario = require("../models/Usuario");

async function populaBanco() {
  try {
    await DefinicoesGerais.findOrCreate({
      where: { tempoJanela: 30 },
      defaults: { endereco: '', tempoJanela: 30 }
    });

    const [usuario] = await Usuario.findOrCreate({
      where: { email: 'admin@cortae.com.br' },
      defaults: { email: 'admin@cortae.com.br', senha: 'admin', funcao: 'Administrador' }
    });

    const [usuarioCliente] = await Usuario.findOrCreate({
      where: { email: 'cliente@cortae.com.br' },
      defaults: { email: 'cliente@cortae.com.br', senha: 'cliente', funcao: 'Cliente' }
    });

    const [cliente] = await Cliente.findOrCreate({
      where: { nome: 'Cliente Cortae' },
      defaults: { nome: 'Cliente Cortae', usuarioId: usuarioCliente.id }
    });

    const [usuarioBarbeiro] = await Usuario.findOrCreate({
      where: { email: 'barbeiro@cortae.com.br' },
      defaults: { email: 'barbeiro@cortae.com.br', senha: 'barbeiro', funcao: 'Barbeiro' }
    });

    const [barbeiro] = await Barbeiro.findOrCreate({
      where: { nome: 'Barbeiro Cortae' },
      defaults: { nome: 'Barbeiro Cortae', sobre: 'Este é o barbeiro cortae', usuarioId: usuarioBarbeiro.id }
    });

    const [servico] = await Servico.findOrCreate({
      where: { nome: 'Corte de cabelo' },
      defaults: { nome: 'Corte de cabelo', preco: 40, numJanelas: 2, descricao: 'Seu cabelo na régua' }
    });

    await BarbeiroServico.findOrCreate({
      where: { barbeiro_id: barbeiro.id, servico_id: servico.id },
      defaults: { barbeiro_id: barbeiro.id, servico_id: servico.id }
    });

    for (let i = 0; i < 7; i++) {
        await HorarioAtendimento.findOrCreate({
          where: { diaDaSemana: i, horarioInicio: '08:00:00', horarioFim: '13:00:00', barbeiro_id: barbeiro.id },
          defaults: { diaDaSemana: i, horarioInicio: '08:00:00', horarioFim: '13:00:00', barbeiro_id: barbeiro.id }
        }),
        await HorarioAtendimento.findOrCreate({
          where: { diaDaSemana: i, horarioInicio: '15:00:00', horarioFim: '20:00:00', barbeiro_id: barbeiro.id },
          defaults: { diaDaSemana: i, horarioInicio: '15:00:00', horarioFim: '20:00:00', barbeiro_id: barbeiro.id }
        })
    }
    console.log('Banco de dados populado com sucesso.');
  } catch (error) {
    console.error('Erro ao popular o banco:', error);
  }
}

module.exports = populaBanco;
