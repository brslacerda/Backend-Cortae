const db = require('../config/db');
const Barbeiro = require('../models/Barbeiro');
const Usuario = require('../models/Usuario');
const { Op } = require('sequelize');
const upload = require('../config/uploads');

const barbeiroController = {
    cadastroBarbeiro: async (req, res) => {
        const { username, email, nome, sobre } = req.body;
        const t = await db.transaction();
        try {
            const usuario = await Usuario.create({
                username,
                email,
                funcao: 'Barbeiro'
            }, { transaction: t });
            const barbeiro = await Barbeiro.create({
                nome,
                sobre,
                usuarioId: usuario.id,
                imagem: req.file ? `/uploads/${req.file.filename}` : null
            }, { transaction: t });
            await t.commit();
            res.status(201).json('Barbeiro e usuario criados com sucesso');
        } catch (error) {
            res.status(500).json({ error: 'Erro ao registrar o barbeiro' });
            await t.rollback();
        }
    },
    barbeirosAtivos: async (req, res) => {
        try {
            const barbeirosAtivos = await Barbeiro.findAll({
                where: {
                    ativo: true
                }, order: [
                    ['nome', 'ASC']
                ],
                limit: 20
            })
            res.status(200).json(barbeirosAtivos);
        } catch {
            res.status(500).json({ message: 'Erro ao obter usuários ativos', error });
        }
    },
    barbeirosPesquisados: async (req, res) => {
        const { busca } = req.body
        try {
            const barbeirosRetorno = await Barbeiro.findAll({
                where: {
                    nome: {
                        [Op.iLike]: `%${busca}%`
                    },
                    ativo: true
                }
            });
            res.status(200).json(barbeirosRetorno);
        } catch {
            res.status(500);
        }
    },
    desativarBarbeiro: async (req, res) => {
        try {
            const { idBarbeiro } = req.body;

            barbeiroADesativar = await Barbeiro.update(
                { ativo: false }, {
                where: {
                    id: idBarbeiro
                }
            }
            );
            if (barbeiroADesativar[0] === 0) {
                return res.status(404).json({ message: 'Barbeiro não encontrado' });
            }

            res.status(200).json('Barbeiro Desativado');
        } catch (error) {
            res.status(500).json({ message: 'Erro ao desativar Barbeiro', error });
        }
    },
    buscaBarbeiroId: async (req, res) => {
        const { barbeiroId } = req.body
        try {
            const barbeirosRetorno = await Barbeiro.findOne({
                where: {
                    id: barbeiroId
                }
            });
            const usuarioBarbeiro = await Usuario.findOne({
                attributes: ['email'], where: {
                    id: barbeirosRetorno.usuarioId
                }
            })
            res.status(200).json({ barbeiro: barbeirosRetorno, emailUsuario: usuarioBarbeiro.email });
        } catch {
            res.status(500);
        }
    },
    alterarBarbeiro: async (req, res) => {
        const { barbeiroId, nome, sobre, email } = req.body;
        try {
            const updateData = {
                nome,
                sobre
            };

            if (req.file) {
                const imagem = req.file.filename;
                updateData.imagem = `/uploads/${imagem}`;
            }

            const barbeiroAtualizado = await Barbeiro.update(updateData, {
                where: {
                    id: barbeiroId
                }
            });

            const barbeiro = await Barbeiro.findOne({
                attributes: ['usuarioId'],
                where: {
                    id: barbeiroId
                }
            });
            const usuarioBarbeiroAtualizado = await Usuario.update({ email }, {
                where: {
                    id: barbeiro.usuarioId
                }
            });

            if (barbeiroAtualizado === 0) {
                return res.status(404).json({ message: 'Barbeiro não encontrado' });
            }
            if (usuarioBarbeiroAtualizado === 0) {
                return res.status(404).json({ message: 'Usuario do barbeiro não encontrado' });
            }

            res.status(200).json({ message: 'Barbeiro atualizado com sucesso' });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao alterar barbeiro', error: error.message });
        }
    },
    buscarNomeBarbeiro: async (req, res) => {
        const { nome } = req.body;

        try {
            const nomeBarbeiro = await Barbeiro.findOne({
                where: {
                    nome: nome
                }
            });

            if (nomeBarbeiro) {
                return res.status(200).json(true); 
            } else {
                return res.status(200).json(false);
            }
        } catch (error) {
            return res.status(500).json({ error: 'Erro no servidor' });
        }
    }


}
module.exports = barbeiroController;