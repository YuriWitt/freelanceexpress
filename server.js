const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'contato@freelanceexpress.com';

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP não configurado. O envio de e-mail estará desativado.');
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

const transporter = createTransporter();

app.post('/api/contact', async (req, res) => {
  const { name, email, service, message } = req.body;

  if (!name || !email || !service || !message) {
    return res.status(400).json({ message: 'Preencha todos os campos antes de enviar.' });
  }

  if (!transporter) {
    return res.status(500).json({ message: 'Servidor de e-mail não configurado. Use o WhatsApp ou e-mail no site.' });
  }

  try {
    await transporter.sendMail({
      from: `Freelance Express <${process.env.SMTP_USER}>`,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `Novo contato: ${service} - ${name}`,
      text: `Nome: ${name}\nEmail: ${email}\nServiço: ${service}\n\nMensagem:\n${message}`,
    });

    res.json({ message: 'Mensagem enviada com sucesso. Entraremos em contato por e-mail em breve.' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({ message: 'Erro interno ao enviar mensagem. Use o WhatsApp ou e-mail diretamente.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
