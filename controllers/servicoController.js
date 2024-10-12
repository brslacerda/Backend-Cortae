const db = require('../config/db');
const { Op } = require('sequelize');
const Servico = require('../models/Servico');

const servicoController = {
    cadastroServico: async (req, res) => {
        const { nome, preco, numJanelas, descricao } = req.body;
        try {
            const novoServico = await Servico.create({
                nome,
                preco,
                numJanelas,
                descricao
            });
            res.status(201).json(novoServico);
        } catch {
            res.status(500).json({ error: 'Erro ao cadastrar o servico' });
        }
    },
    servicosAtivos: async (req, res) => {
        try {
            const servicosAtivos = await Servico.findAll({
                where: {
                    ativo: true
                },
                limit: 20
            })
            res.status(200).json(servicosAtivos);
        } catch {
            res.status(500).json({ message: 'Erro ao obter servicos ativos', error });
        }
    },
    servicosPesquisados: async (req, res) => {
        const { busca } = req.body
        try {
            const servicosRetorno = await Servico.findAll({
                where: {
                    nome: {
                        [Op.iLike]: `%${busca}%`
                    },
                    ativo: true
                }
            });
            res.status(200).json(servicosRetorno);
        } catch {
            res.status(500);
        }
    },
    desativarServico: async (req, res) => {
        try {
            const { idServico } = req.body;

            servicoADesativar = await Servico.update(
                { ativo: false }, {
                where: {
                    id: idServico
                }
            }
            );
            if (servicoADesativar[0] === 0) {
                return res.status(404).json({ message: 'Servico não encontrado' });
            }

            res.status(200).json('Servico Desativado');
        } catch (error) {
            res.status(500).json({ message: 'Erro ao desativar Servico', error });
        }
    },
    buscaServicoId: async (req, res) => {
        const { servicoId } = req.body
        try {
            const servicoRetorno = await Servico.findOne({
                where: {
                    id: servicoId
                }
            });
            res.status(200).json({ servicoRetorno });
        } catch {
            res.status(500);
        }
    },
    alterarServico: async (req, res) => {
        const { servicoId, nome, preco, numJanelas, descricao } = req.body;
        try {
            const updateData = {
                nome,
                preco,
                numJanelas,
                descricao
            };

            const servicoAtualizado = await Servico.update(updateData, {
                where: {
                    id: servicoId
                }
            });

            res.status(200).json({ message: 'Serviço atualizado com sucesso' });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao alterar barbeiro', error: error.message });
        }
    }

}

module.exports = servicoController;