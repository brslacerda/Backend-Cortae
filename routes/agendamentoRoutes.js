const express = require('express');
const router = express.Router();
const Agendamento = require('../models/Agendamento');

router.get('/', async (req, res) => {
  try {
    const agendamentos = await Agendamento.findAll();
    res.json(agendamentos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const novoAgendamento = await Agendamento.create(req.body);
    res.status(201).json(novoAgendamento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const agendamento = await Agendamento.findByPk(req.params.id);
    if (agendamento) {
      res.json(agendamento);
    } else {
      res.status(404).json({ error: 'agendamento não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Agendamento.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const agendamentoAtualizado = await Agendamento.findByPk(req.params.id);
      res.json(agendamentoAtualizado);
    } else {
      res.status(404).json({ error: 'agendamento não encontrado' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Agendamento.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Agendamento não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
