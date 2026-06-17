require('dotenv').config();
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { users } = require('../database/db');
const router  = express.Router();

/* ── Admin Login ─────────────────────────────────────── */
router.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required.' });

  const user = users.findAdmin(username.trim());
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid username or password.' });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
  res.json({ token, role: user.role, username: user.username });
});

/* ── Employee Login ──────────────────────────────────── */
router.post('/employee-login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Employee ID and password are required.' });

  const user = users.findEmployee(username.trim());
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid credentials.' });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, employee_id: user.employee_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
  res.json({ token, role: user.role, username: user.username, employee_id: user.employee_id });
});

module.exports = router;
