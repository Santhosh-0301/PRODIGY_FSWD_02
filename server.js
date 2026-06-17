require('dotenv').config();
const express = require('express');
const path    = require('path');
const cors    = require('cors');
const seed    = require('./database/seed');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ─── */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Static files ─── */
app.use(express.static(path.join(__dirname, 'public')));

/* ── API Routes ─── */
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api',           require('./routes/profile'));

/* ── Page routes ─── */
app.get('/',           (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin',      (_, res) => res.redirect('/admin/login.html'));
app.get('/employee',   (_, res) => res.redirect('/employee/login.html'));

/* ── Error handler ─── */
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

/* ── Boot ─── */
seed();
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   Employee Management System  v1.0   ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
  console.log(`  🚀  Server   → http://localhost:${PORT}`);
  console.log(`  👔  Admin    → http://localhost:${PORT}/admin/login.html`);
  console.log(`  👤  Employee → http://localhost:${PORT}/employee/login.html`);
  console.log('');
  console.log('  Credentials:');
  console.log('  Admin    → admin / admin@123');
  console.log('  Employee → EMP-001 to EMP-008 / emp@123');
  console.log('');
});
