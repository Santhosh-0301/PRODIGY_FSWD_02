import api from '../js/api.js';
import { toast, avatarColor, initials, formatINR, formatDate, deptStyle, statusBadge } from '../js/ui.js';

/* ── Auth guard ─── */
if (!localStorage.getItem('ems_token') || localStorage.getItem('ems_role') !== 'employee') {
  window.location.replace('login.html');
}

/* ── Logout ─── */
document.getElementById('logout-btn')?.addEventListener('click', () => {
  localStorage.clear();
  window.location.replace('login.html');
});

/* ── Load profile ─── */
async function loadProfile() {
  try {
    const emp = await api.get('/api/me');
    renderProfile(emp);
  } catch (err) {
    toast('error', err.message || 'Failed to load profile.');
  }
}

function renderProfile(emp) {
  const color = avatarColor(emp.full_name || '');
  const inits = initials(emp.full_name || '');
  const ds    = deptStyle(emp.department);

  /* Avatar */
  document.querySelectorAll('.profile-avatar').forEach(el => {
    el.style.background = color;
    el.textContent = inits;
  });

  /* Hero section */
  const name = document.getElementById('hero-name');
  const role = document.getElementById('hero-role');
  const dept = document.getElementById('hero-dept');
  const id   = document.getElementById('hero-id');
  const stat = document.getElementById('hero-status');
  if (name) name.textContent = emp.full_name   || '—';
  if (role) role.textContent = emp.job_title   || '—';
  if (dept) dept.textContent = emp.department  || '—';
  if (id)   id.textContent   = emp.employee_id || '—';
  if (stat) stat.innerHTML   = statusBadge(emp.status);

  /* Salary */
  const salEl    = document.getElementById('salary-amount');
  const salLabel = document.getElementById('salary-period');
  if (salEl)    salEl.textContent    = formatINR(emp.salary);
  if (salLabel) salLabel.textContent = 'Per Month (Gross)';

  /* Contact info */
  setText('info-email',  emp.email   || '—');
  setText('info-phone',  emp.phone   || '—');
  setText('info-address',emp.address || '—');

  /* Employment info */
  setText('info-empid',  emp.employee_id  || '—');
  setText('info-dept',   emp.department   || '—');
  setText('info-title',  emp.job_title    || '—');
  setText('info-doj',    formatDate(emp.date_of_join));
  const joinedEl = document.getElementById('info-joined');
  if (joinedEl) joinedEl.textContent = formatDate(emp.date_of_join);

  /* Emergency contact */
  setText('info-emergency', emp.emergency_contact || '—');

  /* Department pill color */
  document.querySelectorAll('.dept-display').forEach(el => {
    el.style.background = ds.bg;
    el.style.color = ds.color;
    el.textContent = emp.department || '—';
  });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

loadProfile();
