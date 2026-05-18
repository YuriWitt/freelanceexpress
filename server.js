require('dotenv').config();

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const cors = require('cors');
const rateLimitLib = require('express-rate-limit');

const app = express();
const rateLimit = rateLimitLib.rateLimit || rateLimitLib;
const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || '';
const TRUST_PROXY = process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1';
const ALLOWED_SERVICES = new Set(['web', 'design', 'marketing', 'conteudo', 'uxui', 'suporte']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (TRUST_PROXY) {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');

const cspDirectives = helmet.contentSecurityPolicy.getDefaultDirectives();
if (!IS_PRODUCTION) {
  delete cspDirectives['upgrade-insecure-requests'];
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: cspDirectives,
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = buildAllowedOrigins();
const apiCors = cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin nao permitida pelo CORS.'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400,
});

app.use('/api', apiCors);
app.options('/api/*', apiCors);
app.use(express.json({ limit: '20kb' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Muitas requisicoes. Aguarde alguns minutos e tente novamente.',
  },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Limite de envios atingido. Tente novamente em 1 hora.',
  },
});

app.use('/api', globalLimiter);
app.use(express.static(path.join(__dirname)));

const transporter = createTransporter();

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'freelance-express-backend',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, service, message, company } = req.body || {};

  if (typeof company === 'string' && company.trim() !== '') {
    return res.status(400).json({ message: 'Requisicao invalida.' });
  }

  const normalizedName = normalizeText(name);
  const normalizedEmail = normalizeText(email).toLowerCase();
  const normalizedService = normalizeText(service).toLowerCase();
  const normalizedMessage = normalizeText(message);

  const validationError = validateContactPayload({
    name: normalizedName,
    email: normalizedEmail,
    service: normalizedService,
    message: normalizedMessage,
  });

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  if (!transporter || !CONTACT_EMAIL) {
    return res.status(503).json({
      message: 'Canal de e-mail indisponivel no momento. Use o WhatsApp para contato imediato.',
    });
  }

  try {
    await transporter.sendMail({
      from: `Freelance Express <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: CONTACT_EMAIL,
      replyTo: normalizedEmail,
      subject: `Novo contato: ${normalizedService} - ${normalizedName}`,
      text: [
        `Nome: ${normalizedName}`,
        `Email: ${normalizedEmail}`,
        `Servico: ${normalizedService}`,
        '',
        'Mensagem:',
        normalizedMessage,
      ].join('\n'),
    });

    return res.json({
      message: 'Mensagem enviada com sucesso. Retornaremos por e-mail em breve.',
    });
  } catch (error) {
    console.error('[contact] erro ao enviar e-mail:', error.message);
    return res.status(500).json({
      message: 'Falha interna ao enviar mensagem. Tente novamente mais tarde.',
    });
  }
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Endpoint nao encontrado.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((error, req, res, next) => {
  if (error && error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON invalido na requisicao.' });
  }

  if (error && error.message && error.message.includes('CORS')) {
    return res.status(403).json({ message: 'Origem nao autorizada.' });
  }

  console.error('[server] erro nao tratado:', error);
  return res.status(500).json({ message: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});

function buildAllowedOrigins() {
  const originsFromEnv = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const origins = new Set(originsFromEnv);

  if (!IS_PRODUCTION) {
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:3000');
    origins.add('http://localhost:5500');
    origins.add('http://127.0.0.1:5500');
  }

  return origins;
}

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_EMAIL) {
    console.warn('[mail] SMTP nao configurado. Endpoint /api/contact ficara indisponivel.');
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

function normalizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/\s+/g, ' ').trim();
}

function validateContactPayload(payload) {
  if (!payload.name || !payload.email || !payload.service || !payload.message) {
    return 'Preencha todos os campos obrigatorios.';
  }

  if (payload.name.length < 2 || payload.name.length > 80) {
    return 'Nome deve ter entre 2 e 80 caracteres.';
  }

  if (payload.email.length > 120 || !EMAIL_PATTERN.test(payload.email)) {
    return 'Informe um e-mail valido.';
  }

  if (!ALLOWED_SERVICES.has(payload.service)) {
    return 'Servico selecionado e invalido.';
  }

  if (payload.message.length < 10 || payload.message.length > 2000) {
    return 'Mensagem deve ter entre 10 e 2000 caracteres.';
  }

  return null;
}
