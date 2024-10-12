const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const JWT_SECRET = process.env.JWT_SECRET || 'defaultSecretKey';
const { OAuth2Client } = require('google-auth-library');
const { Op, where } = require('sequelize');
const Barbeiro = require('../models/Barbeiro');
const Cliente = require('../models/Cliente');
const googleAudience = process.env.Audience_google;
const client = new OAuth2Client(googleAudience);


const usuarioController = {
  registrar: async (req, res) => {
    const { senha, email, funcao } = req.body;

    try {
      const novoUsuario = await Usuario.create({
        senha: senha,
        email,
        funcao,
      });

      res.status(201).json(novoUsuario);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao registrar usuário', error });
    }
  },
  login: async (req, res) => {
    const { email, senha } = req.body;
    console.log(email,senha)
    try {
      const usuario = await Usuario.findOne({ where: { email: email } });

      if (!usuario) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      const isMatch = await bcrypt.compare(senha, usuario.senha);
      if (!isMatch) {
        return res.status(401).json({ message: 'Senha incorreta' });
      }
      let nome;
      let clienteId = null;
      if (usuario.funcao === 'Administrador') {
        nome = usuario.email;
      } else if (usuario.funcao === 'Cliente') {
        const cliente = await Cliente.findOne({ where: { usuarioId: usuario.id } });
        nome = cliente.nome;
        clienteId = cliente.id;
      } else {
        const barbeiro = await Barbeiro.findOne({ where: { usuarioId: usuario.id } });
        nome = barbeiro.nome;
      }

      const userInfo = {
        id: usuario.id,
        email: email,
        funcao: usuario.funcao,
        nome: nome,
        cliente: clienteId
      };
      const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: '10h' });

      res.status(200).json({ message: 'Login bem-sucedido', token, userData: userInfo });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao fazer login', error });
    }
  },
  google: async (req, res) => {
    const { tokenId } = req.body;
    try {
      const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: googleAudience
      });
      const { name, email, sub: googleId } = ticket.getPayload();

      let usuarioExiste = await Usuario.findOne({ where: { email } });
      if (usuarioExiste) {
        const idGoogle = await Usuario.findOne(
          {
            attributes: ['googleId'],
            where: {
              id: usuarioExiste.id
            }
          }
        );
        if (idGoogle == null) {
          usuarioExiste.update({ googleId: googleId });
        }
      } else {
        usuarioExiste = await Usuario.create({ googleId, email, funcao: 'Cliente' });
        cliente = await Cliente.create({ nome: name, usuarioId: usuarioExiste.id });
      }
      const idCliente = await Cliente.findOne({
        where: { usuarioId: usuarioExiste.id }
      })
      const userInfo = {
        email: email,
        funcao: usuarioExiste.funcao,
        nome: name,
        id: usuarioExiste.id,
        cliente: idCliente.id
      };
      const token = jwt.sign({ id: usuarioExiste.id }, JWT_SECRET, { expiresIn: '10h' });
      res.status(200).json({ message: 'Login bem-sucedido', token, userData: userInfo });
    } catch (error) {
      res.status(400).json({ error: 'Erro ao verificar token do Google' });
    }
  },
  usuariosAtivos: async (req, res) => {
    const { qtdeExibicao, pagina } = req.body;
    try {
      const usuariosAtivos = await Usuario.findAll({
        where: {
          ativo: true
        },
        order: [
          ['email', 'ASC']
        ],
        limit: qtdeExibicao,
        offset: (pagina - 1) * qtdeExibicao
      })
      const qtdeUsuarios = await Usuario.count({
        where: {
          ativo: true
        }
      })
      const totalPaginas = Math.ceil(qtdeUsuarios / qtdeExibicao);

      res.status(200).json({
        usuarios: usuariosAtivos,
        totalPaginas: totalPaginas
      });
    } catch {
      res.status(500).json({ message: 'Erro ao obter usuários ativos', error });
    }
  },
  usuariosPesquisados: async (req, res) => {
    const { busca } = req.body
    try {
      const usuariosRetorno = await Usuario.findAll({
        where: {
          email: {
            [Op.iLike]: `%${busca}%`
          },
          ativo: true
        }
      });
      res.status(200).json(usuariosRetorno);
    } catch {
      res.status(500);
    }
  },
  desativarUsuario: async (req, res) => {
    try {
      const { idUsuario } = req.body;

      usuarioADesativar = await Usuario.update(
        { ativo: false }, {
        where: {
          id: idUsuario
        }
      }
      );
      barbeiroADesativar = await Barbeiro.update(
        { ativo: false }, {
        where: {
          usuarioId: idUsuario
        }
      }
      );
      if (usuarioADesativar[0] === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.status(200).json('Usuario Desativado');
    } catch (error) {
      res.status(500).json({ message: 'Erro ao desativar usuário', error });
    }
  },
  buscaUsuarioId: async (req, res) => {
    const { idUsuario } = req.body
    try {
      const usuariosRetorno = await Usuario.findOne({
        where: {
          id: idUsuario
        }
      });
      res.status(200).json(usuariosRetorno);
    } catch {
      res.status(500);
    }
  },
  alterarUsuario: async (req, res) => {
    const { idUsuario, senha, email, funcao } = req.body;
    try {
      const updateData = {
        email,
        funcao
      };
      if (senha) {
        updateData.senha = senha;
      }
      const usuariosAlterados = await Usuario.update(updateData, {
        where: {
          id: idUsuario
        },
        individualHooks:true
      });


      if (usuariosAlterados === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao alterar usuário', error: error.message });
    }
  }
};

module.exports = usuarioController;