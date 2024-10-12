const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const novoUsuario = await Usuario.create(req.body);
    res.status(201).json(novoUsuario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).json({ error: 'Usuario não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Usuario.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const usuarioAtualizado = await Usuario.findByPk(req.params.id);
      res.json(usuarioAtualizado);
    } else {
      res.status(404).json({ error: 'Usuario não encontrado' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Usuario.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Usuario não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;
