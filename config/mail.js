require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const enviarEmailBoasVindas = async (email, nome) => {
  console.log(email, nome);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Bem-vindo à nossa plataforma!',
    text: `Olá ${nome},\n\nObrigado por se cadastrar em nossa plataforma. Estamos felizes em tê-lo conosco!\n\nAtenciosamente,\nEquipe`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail de boas-vindas enviado para:', email);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
};

const enviarEmailAgendamentoConfirmado = async (email, nome, data, servicos) => {
  console.log('chamou');
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Seu agendamento foi confirmado',
    text: `Olá ${nome},\n\nEstamos felizes em informar que seu agendamento foi confirmado em nossa plataforma! \n\nData: ${data}\nServicos: ${servicos}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail de confirmação enviado com sucesso:', email);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
};

const enviarEmailAgendamentoNegado = async (email, nome, data, servicos) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Seu agendamento foi negado',
    text: `Olá ${nome},\n\nEstamos tristes em informar que seu agendamento foi negado em nossa plataforma! \n\nData: ${data}\nServicos: ${servicos}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail de negação enviado com sucesso:', email);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
};

module.exports = { enviarEmailBoasVindas, enviarEmailAgendamentoConfirmado, enviarEmailAgendamentoNegado };
