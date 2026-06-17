const express       = require('express');
const router        = express.Router();
const { employees } = require('../database/db');
const verifyToken   = require('../middleware/verifyToken');

router.get('/me', verifyToken, (req, res) => {
  if (req.user.role === 'admin') {
    return res.json({ username: req.user.username, role: 'admin', full_name: 'Administrator' });
  }

  const emp = employees.findByEmpId(req.user.employee_id);
  if (!emp) return res.status(404).json({ error: 'Employee profile not found.' });

  res.json(emp);
});

module.exports = router;
