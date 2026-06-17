/**
 * Pure-JS JSON database — no native modules, works on any Node.js version.
 * Stores all data in database/data.json and provides a clean typed API.
 */

const fs   = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

// ── Default store shape ────────────────────────────────────────────────────
const DEFAULT = {
  employees: [],
  users: [],
  _seq: { employees: 0, users: 0 },
};

// ── Load ──────────────────────────────────────────────────────────────────
let store;
try {
  store = fs.existsSync(DB_FILE)
    ? JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
    : { ...DEFAULT };
} catch {
  store = { ...DEFAULT };
}
if (!store._seq) store._seq = { employees: 0, users: 0 };

// ── Persist ───────────────────────────────────────────────────────────────
function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf8');
}

function nextId(table) {
  store._seq[table] = (store._seq[table] || 0) + 1;
  return store._seq[table];
}

const now = () => new Date().toISOString();

// ═══════════════════════════════════════════════════════════════════════════
// EMPLOYEES
// ═══════════════════════════════════════════════════════════════════════════
const employees = {
  // ── count helpers ─────────────────────────────────────────────────────
  count() {
    return store.employees.length;
  },
  countActive() {
    return store.employees.filter(e => e.status === 'Active').length;
  },
  countDepts() {
    return new Set(store.employees.map(e => e.department).filter(Boolean)).size;
  },
  countSince(isoDate) {
    return store.employees.filter(e => e.created_at >= isoDate).length;
  },

  // ── query with search / filter / sort ─────────────────────────────────
  query({ search, department, status, sort = 'full_name', order = 'ASC' } = {}) {
    let rows = [...store.employees];

    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(e =>
        (e.full_name   || '').toLowerCase().includes(s) ||
        (e.employee_id || '').toLowerCase().includes(s) ||
        (e.email       || '').toLowerCase().includes(s) ||
        (e.job_title   || '').toLowerCase().includes(s)
      );
    }
    if (department && department !== 'all') rows = rows.filter(e => e.department === department);
    if (status     && status     !== 'all') rows = rows.filter(e => e.status     === status);

    const VALID = ['full_name','employee_id','date_of_join','salary','department','status','created_at'];
    const sf = VALID.includes(sort) ? sort : 'full_name';
    const asc = order !== 'DESC';

    rows.sort((a, b) => {
      if (sf === 'salary') return asc ? a.salary - b.salary : b.salary - a.salary;
      const av = (a[sf] || '').toString().toLowerCase();
      const bv = (b[sf] || '').toString().toLowerCase();
      if (av < bv) return asc ? -1 :  1;
      if (av > bv) return asc ?  1 : -1;
      return 0;
    });

    return rows;
  },

  // ── finders ───────────────────────────────────────────────────────────
  findById(id)         { return store.employees.find(e => e.id === Number(id))            || null; },
  findByEmpId(empId)   { return store.employees.find(e => e.employee_id === empId)         || null; },
  findByEmail(email)   { return store.employees.find(e => (e.email||'').toLowerCase() === (email||'').toLowerCase()) || null; },
  lastEmpId() {
    if (!store.employees.length) return null;
    return store.employees.reduce((best, e) => {
      const n = parseInt((e.employee_id || '').replace('EMP-', '')) || 0;
      const b = parseInt((best || '').replace('EMP-', '')) || 0;
      return n > b ? e.employee_id : best;
    }, null);
  },

  // ── insert ────────────────────────────────────────────────────────────
  insert(data) {
    if (employees.findByEmail(data.email)) {
      const err = new Error('Email already exists.'); err.code = 'UNIQUE'; throw err;
    }
    const emp = {
      id:                nextId('employees'),
      employee_id:       data.employee_id,
      full_name:         (data.full_name         || '').trim(),
      email:             (data.email             || '').toLowerCase().trim(),
      phone:             data.phone              || '',
      department:        data.department         || '',
      job_title:         data.job_title          || '',
      date_of_join:      data.date_of_join       || '',
      salary:            Number(data.salary)     || 0,
      status:            data.status             || 'Active',
      address:           data.address            || '',
      emergency_contact: data.emergency_contact  || '',
      created_at:        now(),
      updated_at:        now(),
    };
    store.employees.push(emp);
    save();
    return emp;
  },

  // ── update ────────────────────────────────────────────────────────────
  update(id, data) {
    const idx = store.employees.findIndex(e => e.id === Number(id));
    if (idx === -1) return null;
    if (data.email) {
      const conflict = employees.findByEmail(data.email);
      if (conflict && conflict.id !== Number(id)) {
        const err = new Error('Email already exists.'); err.code = 'UNIQUE'; throw err;
      }
    }
    const cur = store.employees[idx];
    store.employees[idx] = {
      ...cur,
      full_name:         data.full_name         != null ? data.full_name.trim()              : cur.full_name,
      email:             data.email             != null ? data.email.toLowerCase().trim()    : cur.email,
      phone:             data.phone             != null ? data.phone                         : cur.phone,
      department:        data.department        != null ? data.department                    : cur.department,
      job_title:         data.job_title         != null ? data.job_title                     : cur.job_title,
      date_of_join:      data.date_of_join      != null ? data.date_of_join                  : cur.date_of_join,
      salary:            data.salary            != null ? Number(data.salary)                : cur.salary,
      status:            data.status            != null ? data.status                        : cur.status,
      address:           data.address           != null ? data.address                       : cur.address,
      emergency_contact: data.emergency_contact != null ? data.emergency_contact             : cur.emergency_contact,
      updated_at: now(),
    };
    save();
    return store.employees[idx];
  },

  // ── delete ────────────────────────────────────────────────────────────
  delete(id) {
    const idx = store.employees.findIndex(e => e.id === Number(id));
    if (idx === -1) return null;
    const [removed] = store.employees.splice(idx, 1);
    save();
    return removed;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════════
const users = {
  isSeeded()           { return store.users.some(u => u.username === 'admin'); },
  findAdmin(username)  { return store.users.find(u => u.role === 'admin'    && u.username   === username)                             || null; },
  findEmployee(input)  { return store.users.find(u => u.role === 'employee' && (u.username  === input || u.employee_id === input.toUpperCase())) || null; },
  findByEmpId(empId)   { return store.users.find(u => u.employee_id === empId)                                                        || null; },

  insert(data) {
    const user = {
      id:          nextId('users'),
      username:    data.username,
      password:    data.password,
      role:        data.role,
      employee_id: data.employee_id || null,
      created_at:  now(),
    };
    store.users.push(user);
    save();
    return user;
  },

  deleteByEmpId(empId) {
    store.users = store.users.filter(u => u.employee_id !== empId);
    save();
  },
};

module.exports = { employees, users };
