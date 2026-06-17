import api from '../js/api.js';
import { toast, avatarColor, initials, formatINR, formatDate, deptStyle, countUp, btnLoading, statusBadge } from '../js/ui.js';
import { validateField, clearAllErrors, rules } from '../js/validators.js';

/* ── Auth guard ─── */
if (!localStorage.getItem('ems_token') || localStorage.getItem('ems_role') !== 'admin') {
  window.location.replace('login.html');
}

/* ── State ─── */
let employees  = [];
let editingId  = null;
let deleteId   = null;
let sortField  = 'full_name';
let sortOrder  = 'ASC';

/* ── DOM refs ─── */
const statEls = {
  total:   document.getElementById('stat-total'),
  active:  document.getElementById('stat-active'),
  depts:   document.getElementById('stat-depts'),
  newMon:  document.getElementById('stat-new'),
};
const tbody       = document.getElementById('emp-tbody');
const empCount    = document.getElementById('emp-count');
const searchInput = document.getElementById('search-input');
const deptFilter  = document.getElementById('dept-filter');
const statFilter  = document.getElementById('stat-filter');
const modal       = document.getElementById('emp-modal');
const modalTitle  = document.getElementById('modal-title');
const empForm     = document.getElementById('emp-form');
const saveBtn     = document.getElementById('save-btn');
const confirmOvl  = document.getElementById('confirm-overlay');
const confirmDelBtn = document.getElementById('confirm-delete-btn');
const adminName   = document.getElementById('admin-name');
const logoutBtn   = document.getElementById('logout-btn');

/* ── Sidebar ─── */
const sidebarName = document.getElementById('sidebar-username');
if (sidebarName) sidebarName.textContent = localStorage.getItem('ems_username') || 'Admin';
if (adminName)   adminName.textContent   = localStorage.getItem('ems_username') || 'Admin';

/* ── Logout ─── */
logoutBtn?.addEventListener('click', () => {
  localStorage.clear();
  window.location.replace('login.html');
});

/* ── Load data ─── */
async function loadData() {
  try {
    const params = new URLSearchParams();
    if (searchInput.value) params.set('search', searchInput.value);
    if (deptFilter.value  && deptFilter.value  !== 'all') params.set('department', deptFilter.value);
    if (statFilter.value  && statFilter.value  !== 'all') params.set('status',     statFilter.value);
    params.set('sort',  sortField);
    params.set('order', sortOrder);

    const data = await api.get(`/api/employees?${params}`);
    employees = data.employees;
    renderStats(data.stats);
    renderTable();
  } catch (err) {
    toast('error', err.message || 'Failed to load employees.');
  }
}

/* ── Render stats ─── */
let statsAnimated = false;
function renderStats(stats) {
  if (!statsAnimated) {
    if (statEls.total)  countUp(statEls.total,  stats.total);
    if (statEls.active) countUp(statEls.active,  stats.active);
    if (statEls.depts)  countUp(statEls.depts,   stats.departments);
    if (statEls.newMon) countUp(statEls.newMon,  stats.newThisMonth);
    statsAnimated = true;
  } else {
    if (statEls.total)  statEls.total.textContent  = stats.total;
    if (statEls.active) statEls.active.textContent = stats.active;
    if (statEls.depts)  statEls.depts.textContent  = stats.departments;
    if (statEls.newMon) statEls.newMon.textContent = stats.newThisMonth;
  }
}

/* ── Render table ─── */
function renderTable() {
  if (empCount) empCount.textContent = `${employees.length} employee${employees.length !== 1 ? 's' : ''}`;

  if (!employees.length) {
    tbody.innerHTML = `
      <tr><td colspan="8">
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-title">No employees found</div>
          <div class="empty-desc">Try adjusting your filters or add a new employee.</div>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = employees.map(emp => {
    const col   = avatarColor(emp.full_name);
    const inits = initials(emp.full_name);
    const ds    = deptStyle(emp.department);
    return `
    <tr>
      <td>
        <div class="emp-cell">
          <div class="avatar" style="background:${col}">${inits}</div>
          <div>
            <div class="emp-name">${emp.full_name}</div>
            <div class="emp-email">${emp.email}</div>
          </div>
        </div>
      </td>
      <td><span style="font-size:0.8125rem;font-weight:600;color:#6b7280;">${emp.employee_id}</span></td>
      <td><span class="dept-pill" style="background:${ds.bg};color:${ds.color}">${emp.department || '—'}</span></td>
      <td>${emp.job_title || '—'}</td>
      <td>${statusBadge(emp.status)}</td>
      <td><span class="salary-text">${formatINR(emp.salary)}</span></td>
      <td style="color:var(--text-muted);font-size:0.8125rem">${formatDate(emp.date_of_join)}</td>
      <td>
        <div class="row-actions">
          <button class="btn-row-edit"  onclick="openEdit(${emp.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button class="btn-row-delete" onclick="openDelete(${emp.id},'${emp.full_name.replace(/'/g,"\\'")}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Delete
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/* ── Search / Filter ─── */
let debounceTimer;
searchInput?.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadData, 300);
});
deptFilter?.addEventListener('change', loadData);
statFilter?.addEventListener('change', loadData);

/* ── Sort ─── */
document.querySelectorAll('th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const field = th.dataset.sort;
    if (sortField === field) sortOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC';
    else { sortField = field; sortOrder = 'ASC'; }
    document.querySelectorAll('th[data-sort]').forEach(t => t.removeAttribute('data-active'));
    th.dataset.active = sortOrder;
    loadData();
  });
});

/* ── Modal open/close ─── */
function openModal() {
  modal?.classList.add('active');
  document.getElementById('modal-overlay')?.classList.add('active');
}
function closeModal() {
  document.getElementById('modal-overlay')?.classList.remove('active');
  editingId = null;
  empForm?.reset();
  if (empForm) clearAllErrors(empForm);
}
document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeConfirm(); } });

/* ── Open Add ─── */
document.getElementById('add-emp-btn')?.addEventListener('click', () => {
  editingId = null;
  if (modalTitle) modalTitle.textContent = 'Add New Employee';
  empForm?.reset();
  if (empForm) clearAllErrors(empForm);
  // Reset employee_id field to auto
  const empIdField = document.getElementById('f-emp-id');
  if (empIdField) { empIdField.value = 'Auto-generated'; empIdField.readOnly = true; }
  openModal();
});

/* ── Open Edit ─── */
window.openEdit = async (id) => {
  editingId = id;
  if (modalTitle) modalTitle.textContent = 'Edit Employee';
  empForm?.reset();
  if (empForm) clearAllErrors(empForm);
  try {
    const emp = await api.get(`/api/employees/${id}`);
    document.getElementById('f-name').value        = emp.full_name        || '';
    document.getElementById('f-email').value       = emp.email            || '';
    document.getElementById('f-phone').value       = emp.phone            || '';
    document.getElementById('f-dept').value        = emp.department       || '';
    document.getElementById('f-title').value       = emp.job_title        || '';
    document.getElementById('f-doj').value         = emp.date_of_join     || '';
    document.getElementById('f-salary').value      = emp.salary           || '';
    document.getElementById('f-status').value      = emp.status           || 'Active';
    document.getElementById('f-address').value     = emp.address          || '';
    document.getElementById('f-emergency').value   = emp.emergency_contact || '';
    const empIdField = document.getElementById('f-emp-id');
    if (empIdField) { empIdField.value = emp.employee_id; empIdField.readOnly = true; }
    openModal();
  } catch (err) {
    toast('error', 'Failed to load employee details.');
  }
};

/* ── Save (Add/Edit) ─── */
empForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nameEl   = document.getElementById('f-name');
  const emailEl  = document.getElementById('f-email');
  const phoneEl  = document.getElementById('f-phone');
  const salaryEl = document.getElementById('f-salary');
  const dojEl    = document.getElementById('f-doj');

  const v1 = validateField(nameEl,   rules.required);
  const v2 = validateField(emailEl,  (v) => rules.required(v) || rules.email(v));
  const v3 = validateField(phoneEl,  rules.phone);
  const v4 = validateField(salaryEl, rules.salary);
  const v5 = validateField(dojEl,    rules.pastDate);
  if (!v1 || !v2 || !v3 || !v4 || !v5) return;

  const payload = {
    full_name:         nameEl.value.trim(),
    email:             emailEl.value.trim(),
    phone:             document.getElementById('f-phone').value.trim(),
    department:        document.getElementById('f-dept').value,
    job_title:         document.getElementById('f-title').value.trim(),
    date_of_join:      document.getElementById('f-doj').value,
    salary:            document.getElementById('f-salary').value,
    status:            document.getElementById('f-status').value,
    address:           document.getElementById('f-address').value.trim(),
    emergency_contact: document.getElementById('f-emergency').value.trim(),
  };

  btnLoading(saveBtn, true);
  try {
    if (editingId) {
      await api.put(`/api/employees/${editingId}`, payload);
      toast('success', `${payload.full_name}'s details updated.`);
    } else {
      const res = await api.post('/api/employees', payload);
      toast('success', res.message || 'Employee added!');
    }
    closeModal();
    statsAnimated = false;
    await loadData();
  } catch (err) {
    toast('error', err.message || 'Failed to save.');
  } finally {
    btnLoading(saveBtn, false);
  }
});

/* ── Delete ─── */
window.openDelete = (id, name) => {
  deleteId = id;
  const nameEl = document.getElementById('confirm-emp-name');
  if (nameEl) nameEl.textContent = name;
  confirmOvl?.classList.add('active');
};
function closeConfirm() {
  confirmOvl?.classList.remove('active');
  deleteId = null;
}
document.getElementById('cancel-delete-btn')?.addEventListener('click', closeConfirm);
confirmOvl?.addEventListener('click', (e) => { if (e.target === confirmOvl) closeConfirm(); });

confirmDelBtn?.addEventListener('click', async () => {
  if (!deleteId) return;
  btnLoading(confirmDelBtn, true);
  try {
    await api.delete(`/api/employees/${deleteId}`);
    toast('success', 'Employee deleted successfully.');
    closeConfirm();
    statsAnimated = false;
    await loadData();
  } catch (err) {
    toast('error', err.message || 'Failed to delete.');
  } finally {
    btnLoading(confirmDelBtn, false);
  }
});

/* ── Boot ─── */
loadData();
