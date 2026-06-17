const express       = require('express');
const bcrypt        = require('bcryptjs');
const router        = express.Router();
const { employees, users } = require('../database/db');
const verifyToken   = require('../middleware/verifyToken');
const adminOnly     = require('../middleware/adminOnly');

router.use(verifyToken, adminOnly);

/* ── helpers ─────────────────────────────────────────── */
function nextEmpId() {
  const last = employees.lastEmpId();
  if (!last) return 'EMP-001';
  const n = parseInt(last.replace('EMP-', ''), 10);
  return `EMP-${String(n + 1).padStart(3, '0')}`;
}

function getStats() {
  const today = new Date();
  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,'0')}-01`;
  return {
    total:        employees.count(),
    active:       employees.countActive(),
    departments:  employees.countDepts(),
    newThisMonth: employees.countSince(monthStart),
  };
}

/* ── GET all ─────────────────────────────────────────── */
router.get('/', (req, res) => {
  const { search, department, status, sort, order } = req.query;
  const list = employees.query({ search, department, status, sort, order });
  res.json({ employees: list, stats: getStats() });
});

/* ── GET one ─────────────────────────────────────────── */
router.get('/:id', (req, res) => {
  const emp = employees.findById(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found.' });
  res.json(emp);
});

/* ── POST create ─────────────────────────────────────── */
router.post('/', (req, res) => {
  const { full_name, email, phone, department, job_title,
          date_of_join, salary, status, address, emergency_contact } = req.body;

  if (!full_name?.trim()) return res.status(400).json({ error: 'Full name is required.' });
  if (!email?.trim())     return res.status(400).json({ error: 'Email is required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email format.' });

  try {
    const employee_id = nextEmpId();
    const emp = employees.insert({
      employee_id, full_name, email, phone, department,
      job_title, date_of_join, salary, status, address, emergency_contact,
    });

    const hash = bcrypt.hashSync('emp@123', 10);
    users.insert({ username: employee_id, password: hash, role: 'employee', employee_id });

    res.status(201).json({ ...emp, message: `Created! Login: ${employee_id} / emp@123` });
  } catch (err) {
    if (err.code === 'UNIQUE') return res.status(400).json({ error: 'Email already exists.' });
    res.status(500).json({ error: err.message });
  }
});

/* ── PUT update ──────────────────────────────────────── */
router.put('/:id', (req, res) => {
  const emp = employees.findById(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found.' });

  const { email } = req.body;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email format.' });

  try {
    const updated = employees.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    if (err.code === 'UNIQUE') return res.status(400).json({ error: 'Email already exists.' });
    res.status(500).json({ error: err.message });
  }
});

/* ── DELETE ──────────────────────────────────────────── */
router.delete('/:id', (req, res) => {
  const emp = employees.findById(req.params.id);
  if (!emp) return res.status(404).json({ error: 'Employee not found.' });

  users.deleteByEmpId(emp.employee_id);
  employees.delete(req.params.id);
  res.json({ message: 'Employee deleted successfully.' });
});

module.exports = router;
