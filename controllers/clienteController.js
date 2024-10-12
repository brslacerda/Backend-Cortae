const Cliente = require("../models/Cliente");
const Usuario = require("../models/Usuario");
const db = require('../config/db');
const { Op } = require('sequelize');
const { enviarEmailBoasVindas } = require('../config/mail');

const clienteController = {
    cadastroCliente: async (req, res) => {
        const { nome, email, telefone, cep, estado, cidade, bairro, logradouro, numero, complemento } = req.body;
        console.log(nome, email, telefone, cep, estado, cidade, bairro, logradouro, numero, complemento);
        const t = await db.transaction();
        try {
            const novoUsuario = await Usuario.create({
                email,
                funcao: 'Cliente'
            }, { transaction: t });
            const cliente = await Cliente.create({
                nome,
                email,
                telefone,
                cep,
                estado,
                cidade,
                bairro,
                logradouro,
                numero,
                complemento,
                usuarioId: novoUsuario.id
            }, { transaction: t });
            await t.commit();
            res.status(201).json('ClienteCriado');
        } catch {
            res.status(500).json({ error: 'Erro ao registrar o barbeiro' });
            await t.rollback();
        }
    },
    novoCliente: async (req, res) => {
        const { email, nome, telefone, senha } = req.body;
        const t = await db.transaction();
        try {
            const novoUsuario = await Usuario.create({
                senha: senha,
                email,
                funcao: 'Cliente'
            }, { transaction: t });
            const cliente = await Cliente.create({
                nome,
                telefone,
                usuarioId: novoUsuario.id
            }, { transaction: t });

            await enviarEmailBoasVindas(email, nome);

            await t.commit();
            res.status(201).json('ClienteCriado');
        } catch (error) {
            await t.rollback();
            console.error('Erro ao criar cliente:', error);
            res.status(500).json({ error: 'Erro ao registrar o cliente' });
        }
    },
    clientesAtivos: async (req, res) => {
        try {
            const clientesAtivos = await Cliente.findAll({
                where: {
                    ativo: true
                },
                limit: 20
            })
            res.status(200).json(clientesAtivos);
        } catch {
            res.status(500).json({ message: 'Erro ao obter clientes ativos', error });
        }
    },
    clientesPesquisados: async (req, res) => {
        const { busca } = req.body
        try {
            const clientesRetorno = await Cliente.findAll({
                where: {
                    nome: {
                        [Op.iLike]: `%${busca}%`
                    },
                    ativo: true
                }
            });
            res.status(200).json(clientesRetorno);
        } catch {
            res.status(500);
        }
    },
    desativarCliente: async (req, res) => {
        try {
            const { idCliente } = req.body;

            clienteADesativar = await Cliente.update(
                { ativo: false }, {
                where: {
                    id: idCliente
                }
            }
            );
            if (clienteADesativar[0] === 0) {
                return res.status(404).json({ message: 'Cliente não encontrado' });
            }

            res.status(200).json('Cliente Desativado');
        } catch (error) {
            res.status(500).json({ message: 'Erro ao desativar usuário', error });
        }
    },
    buscaClienteId: async (req, res) => {
        const { clienteId } = req.body
        try {
            const clienteRetorno = await Cliente.findOne({
                where: {
                    id: clienteId
                }
            });
            const usuarioCliente = await Usuario.findOne({
                attributes: ['email'], where: {
                    id: clienteRetorno.usuarioId
                }
            })
            res.status(200).json({ cliente: clienteRetorno, emailCliente: usuarioCliente.email });
        } catch {
            res.status(500);
        }
    },
    alterarCliente: async (req, res) => {
        const { clienteId, nome, email, telefone, cep, estado, cidade, bairro, logradouro, numero, complemento } = req.body;
        try {
            const updateData = {
                nome,
                telefone,
                cep,
                estado,
                cidade,
                bairro,
                logradouro,
                numero,
                complemento
            };

            const clienteAtualizado = await Cliente.update(updateData, {
                where: {
                    id: clienteId
                }
            });
            const cliente = await Cliente.findOne({
                attributes: ['usuarioId'],
                where: {
                    id: clienteId
                }
            });
            const usuarioClienteAtualizado = await Usuario.update({ email }, {
                where: {
                    id: cliente.usuarioId
                }
            });

            if (clienteAtualizado === 0) {
                return res.status(404).json({ message: 'Cliente não encontrado' });
            }
            if (usuarioClienteAtualizado === 0) {
                return res.status(404).json({ message: 'Usuario do cliente não encontrado' });
            }

            res.status(200).json({ message: 'Cliente atualizado com sucesso' });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao alterar cliente', error: error.message });
        }
    }
}

module.exports = clienteController;