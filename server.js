const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());

const allowedOrigins = [/\.nestcrm\.com\.au$/, 'https://nestcrm.com.au'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


// ✅ Health check para o ALB
app.get('/', (req, res) => {
  res.send('✅ EC2 instance is running and healthy!');
});

// ✅ Exemplo de rota de API
app.get('/api/status', (req, res) => {
  res.json({ message: '🟢 API is working fine for this tenant!', tenant: req.hostname });
});

// ✅ Exemplo de rota de dados fictícios
app.get('/api/data', (req, res) => {
  res.json({ data: ['Item 1', 'Item 2', 'Item 3'], tenant: req.hostname });
});

// ✅ Porta deve permanecer 3000 (como configurado no Target Group)
app.listen(3000, '0.0.0.0', () => {
  console.log('✅ Backend API server running on port 3000');
});
