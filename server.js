const express = require('express');
const populaBanco = require('./config/populaBanco');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/db');
const upload = require('./config/uploads');
const path = require('path');

const usuarioController = require('./controllers/usuarioController');
const barbeiroController = require('./controllers/barbeiroController');


const verifyToken = require('./middlewares/authMiddleware');

const Usuario = require('./models/Usuario');
const Barbeiro = require('./models/Barbeiro');
const Cliente = require('./models/Cliente');
const Agendamento = require('./models/Agendamento');
const AgendamentoServico = require('./models/AgendamentoServico');
const BarbeiroServico = require('./models/BarbeiroServico');
const Servico = require('./models/Servico');
const RestricaoHorario = require('./models/RestricaoHorario');
const HorarioAtendimento = require('./models/HorarioAtendimento');
const DefinicoesGerais = require('./models/DefinicoesGerais');
const clienteController = require('./controllers/clienteController');
const servicoController = require('./controllers/servicoController');
const agendamentoController = require('./controllers/agendamentoController');
const barbeiroServicoController = require('./controllers/barbeiroServicoController');
const horarioAtendimentoController = require('./controllers/horarioAtendimentoController');
const definicoesGerais = require('./controllers/definicoesGeraisController');
const restricaoHorarioController = require('./controllers/restricaoHorarioController');
const criptografia = require('./middlewares/criptografia');
const app = express();

// #region Associacoes
Usuario.hasOne(Barbeiro, { foreignKey: 'usuarioId' });
Barbeiro.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Barbeiro.hasMany(Agendamento, { foreignKey: 'barbeiro_id' });
Agendamento.belongsTo(Barbeiro, { foreignKey: 'barbeiro_id' });

Barbeiro.hasMany(HorarioAtendimento, { foreignKey: 'barbeiro_id' });
HorarioAtendimento.belongsTo(Barbeiro, { foreignKey: 'barbeiro_id' });

Barbeiro.hasMany(BarbeiroServico, { foreignKey: 'barbeiro_id' });
BarbeiroServico.belongsTo(Barbeiro, { foreignKey: 'barbeiro_id' });

Barbeiro.hasMany(RestricaoHorario, { foreignKey: 'barbeiro_id' });
RestricaoHorario.belongsTo(Barbeiro, { foreignKey: 'barbeiro_id' });

Servico.hasMany(BarbeiroServico, { foreignKey: 'servico_id' });
BarbeiroServico.belongsTo(Servico, { foreignKey: 'servico_id' });

Usuario.hasOne(Cliente, { foreignKey: 'usuarioId' });
Cliente.belongsTo(Usuario, { foreignKey: 'usuarioId' });

Cliente.hasMany(Agendamento, { foreignKey: 'cliente_id' });
Agendamento.belongsTo(Cliente, { foreignKey: 'cliente_id' });

Agendamento.hasMany(AgendamentoServico, { foreignKey: 'agendamento_id' });
AgendamentoServico.belongsTo(Agendamento, { foreignKey: 'agendamento_id' });

Servico.hasMany(AgendamentoServico, { foreignKey: 'servico_id' });
AgendamentoServico.belongsTo(Servico, { foreignKey: 'servico_id' });
// #endregion

// #region Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// #endregion

// #region Rotas
app.post('/api/usuarios/login', usuarioController.login);
app.post('/api/usuarios/google', usuarioController.google);
app.post('/api/usuarios/criar', usuarioController.registrar);
app.post('/api/usuario/id', usuarioController.buscaUsuarioId);
app.put('/api/usuarios/atualizar/', usuarioController.alterarUsuario);
app.post('/api/usuariosAtivos', usuarioController.usuariosAtivos);
app.put('/api/desativarUsuario', usuarioController.desativarUsuario);
app.post('/api/usuariosBuscados', usuarioController.usuariosPesquisados);

app.post('/api/barbeiro/id', barbeiroController.buscaBarbeiroId);
app.put('/api/atualizarBarbeiro', upload.single('imagem'), barbeiroController.alterarBarbeiro);
app.post('/api/cadastroBarbeiro', upload.single('imagem'), barbeiroController.cadastroBarbeiro);
app.put('/api/desativarBarbeiro', barbeiroController.desativarBarbeiro);
app.get('/api/barbeirosAtivos', barbeiroController.barbeirosAtivos);
app.post('/api/barbeirosBuscados', barbeiroController.barbeirosPesquisados);

app.post('/api/cliente/id', clienteController.buscaClienteId);
app.put('/api/atualizarCliente', clienteController.alterarCliente);
app.get('/api/clientesAtivos', clienteController.clientesAtivos);
app.post('/api/cadastroCliente', clienteController.cadastroCliente);
app.post('/api/novoCliente', clienteController.novoCliente);
app.put('/api/desativarCliente', clienteController.desativarCliente);
app.post('/api/clientesBuscados', clienteController.clientesPesquisados);

app.post('/api/servico/id', servicoController.buscaServicoId);
app.put('/api/atualizarServico', servicoController.alterarServico);
app.get('/api/servicosAtivos', servicoController.servicosAtivos);
app.post('/api/cadastroServico', servicoController.cadastroServico);
app.put('/api/desativarServico', servicoController.desativarServico);
app.post('/api/servicosBuscados', servicoController.servicosPesquisados);

app.get('/api/agendamentosAtivos', agendamentoController.agendamentosAtivos);
app.get('/api/agendamentosBarbeirosClientes', agendamentoController.agendamentosBarbeirosClientes);
app.get('/api/agendamentosPendentes', agendamentoController.agendamentosPendentes);
app.post('/api/agendamento/id', agendamentoController.buscaAgendamentoId);
app.post('/api/agendametosClientes', agendamentoController.buscaAgendamentoClienteId);
app.post('/api/aprovarOuNegarAgendamento', agendamentoController.aprovarOuNegarAgendamento);
app.post('/api/horariosDisponiveis', agendamentoController.horariosDisponiveis);
app.post('/api/horariosDisponiveisEdicao', agendamentoController.horariosDisponiveisEdicao);
app.post('/api/cadastroAgendamento', agendamentoController.cadastroAgendamento);
app.post('/api/duracaoAgendamento', agendamentoController.duracaoAgendamento);
app.post('/api/infosAgendamento', agendamentoController.infosAgendamento);
app.post('/api/atualizarAgendamento', agendamentoController.atualizarAgendamento);

app.post('/api/barbeiroServicos', barbeiroServicoController.barbeiroServicos);
app.post('/api/cadastrarOuAtualizarBarbeiroServicos', barbeiroServicoController.cadastrarOuAtualizarBarbeiroServicos);
app.post('/api/servicoBarbeiros', barbeiroServicoController.servicosBarbeiros);
app.post('/api/cadastrarOuAtualizarServicoBarbeiros', barbeiroServicoController.cadastrarOuAtualizarServicoBarbeiro);

app.post('/api/horariosBarbeiro', horarioAtendimentoController.horarioBarbeiro);
app.post('/api/cadastrarOuAtualizarHorariosBarbeiro', horarioAtendimentoController.cadastrarOuAtualizarHorariosBarbeiro);

app.post('/api/restricoesHorarioBabreiro', restricaoHorarioController.restricoesHorarioBarbeiro);
app.post('/api/cadastrarOuAtualizarRestricoesHorarioBarbeiro', restricaoHorarioController.cadastrarOuAtualizarRestricoesHorarioBarbeiro);

app.get('/api/tempoJanela', definicoesGerais.tempoJanela);

app.post('/api/desencriptar', criptografia.desencriptar);
app.post('/api/encriptar', criptografia.encriptar);

// app.get('/api/protected-route', verifyToken, (req, res) => {
//   res.status(200).json({ message: 'Acesso permitido', userId: req.userId });
// });
// #endregion 

// #region Banco de dados
db.sync({ alter: true })
  .then(() => {
    console.log('Banco de dados conectado');
    populaBanco();
    // Porta do servidor
    const PORTA = 3333;
    app.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`));
  })
  .catch(erro => console.log('Erro ao conectar ao banco de dados: ' + erro));
// #endregion

