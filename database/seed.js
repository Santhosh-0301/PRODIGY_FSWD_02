const { employees, users } = require('./db');
const bcrypt = require('bcryptjs');

const seed = () => {
  if (users.isSeeded()) { console.log('✅  DB already seeded — skipping.'); return; }

  console.log('🌱  Seeding database...');
  const SALT    = 10;
  const adminPw = bcrypt.hashSync('admin@123', SALT);
  const empPw   = bcrypt.hashSync('emp@123',   SALT);

  users.insert({ username: 'admin', password: adminPw, role: 'admin' });

  const EMPS = [
    { id:'EMP-001', name:'Arjun Sharma',   email:'arjun.sharma@company.com',   phone:'9876543210', dept:'Engineering', title:'Software Engineer',   doj:'2022-03-15', salary:85000, status:'Active',   addr:'Mumbai, Maharashtra',      ec:'Meera Sharma — 9123456780' },
    { id:'EMP-002', name:'Priya Patel',    email:'priya.patel@company.com',    phone:'9876543211', dept:'HR',          title:'HR Manager',          doj:'2021-07-01', salary:72000, status:'Active',   addr:'Ahmedabad, Gujarat',       ec:'Rakesh Patel — 9123456781' },
    { id:'EMP-003', name:'Rahul Kumar',    email:'rahul.kumar@company.com',    phone:'9876543212', dept:'Finance',     title:'Financial Analyst',   doj:'2023-01-10', salary:68000, status:'Active',   addr:'New Delhi, NCR',           ec:'Sunita Kumar — 9123456782' },
    { id:'EMP-004', name:'Sneha Gupta',    email:'sneha.gupta@company.com',    phone:'9876543213', dept:'Marketing',   title:'Marketing Executive', doj:'2022-09-20', salary:60000, status:'On Leave', addr:'Bangalore, Karnataka',     ec:'Anil Gupta — 9123456783' },
    { id:'EMP-005', name:'Vikram Singh',   email:'vikram.singh@company.com',   phone:'9876543214', dept:'Operations',  title:'Operations Manager',  doj:'2020-11-05', salary:95000, status:'Active',   addr:'Pune, Maharashtra',        ec:'Kavita Singh — 9123456784' },
    { id:'EMP-006', name:'Ananya Reddy',   email:'ananya.reddy@company.com',   phone:'9876543215', dept:'Design',      title:'UI/UX Designer',      doj:'2023-04-18', salary:78000, status:'Active',   addr:'Hyderabad, Telangana',     ec:'Ramesh Reddy — 9123456785' },
    { id:'EMP-007', name:'Mohit Joshi',    email:'mohit.joshi@company.com',    phone:'9876543216', dept:'Engineering', title:'Backend Developer',   doj:'2021-12-01', salary:90000, status:'Active',   addr:'Noida, Uttar Pradesh',     ec:'Geeta Joshi — 9123456786' },
    { id:'EMP-008', name:'Deepika Nair',   email:'deepika.nair@company.com',   phone:'9876543217', dept:'Finance',     title:'Accounts Manager',    doj:'2022-06-15', salary:75000, status:'Inactive', addr:'Kochi, Kerala',            ec:'Suresh Nair — 9123456787' },
  ];

  for (const e of EMPS) {
    employees.insert({
      employee_id: e.id, full_name: e.name, email: e.email, phone: e.phone,
      department: e.dept, job_title: e.title, date_of_join: e.doj,
      salary: e.salary, status: e.status, address: e.addr, emergency_contact: e.ec,
    });
    users.insert({ username: e.id, password: empPw, role: 'employee', employee_id: e.id });
  }

  console.log('✅  Seeded: 1 admin + 8 employees');
};

module.exports = seed;
