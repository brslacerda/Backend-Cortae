const express = require('express');
const router = express.Router();
const Barbeiro = require('../models/Barbeiro');

router.get('/', async (req, res) => {
  try {
    const barbeiros = await Barbeiro.findAll();
    res.json(barbeiros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const novoBarbeiro = await Barbeiro.create(req.body);
    res.status(201).json(novoBarbeiro);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const barbeiro = await Barbeiro.findByPk(req.params.id);
    if (barbeiro) {
      res.json(barbeiro);
    } else {
      res.status(404).json({ error: 'barbeiro não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Barbeiro.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const barbeiroAtualizado = await Barbeiro.findByPk(req.params.id);
      res.json(barbeiroAtualizado);
    } else {
      res.status(404).json({ error: 'barbeiro não encontrado' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Barbeiro.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'barbeiro não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
