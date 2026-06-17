# Employee Management System 👥

![EMS Banner](https://img.shields.io/badge/Project-Task_2-brightgreen?style=for-the-badge&logo=prodigy) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

A secure, role-based Employee Management System built as part of the **Prodigy InfoTech Full Stack Web Development Internship (Task 02)**. 

This project goes beyond generic layouts by focusing on a **custom modern, human-centric design** (light theme, glassmorphism, dynamic micro-animations) and a robust **Node.js backend**.

---

## ✨ Features

### 👔 Admin Portal
* **Full CRUD Control:** Create, read, update, and delete employee records effortlessly.
* **Dashboard Analytics:** Live headcount stats, department breakdowns, and dynamic searching.
* **Security:** Protected routes using JWT Authentication and secure password hashing with bcrypt.

### 👤 Employee Portal
* **Personalized Dashboard:** Employees can securely log in using their Employee ID to view personal profiles.
* **Data Privacy:** Employees can view their salary, emergency contacts, and department data, but cannot edit core records.

### 🎨 Modern UI/UX
* Built with a custom Vanilla CSS architecture using the **Plus Jakarta Sans** font.
* No generic libraries (like Bootstrap/Tailwind) — every component, hover effect, and layout is built from scratch to achieve a premium, state-of-the-art aesthetic.

---

## 🛠️ Technology Stack

* **Frontend:** HTML5, CSS3 (Custom Architecture), Vanilla JavaScript (ES6 Modules)
* **Backend:** Node.js, Express.js
* **Database:** Custom Pure-JS JSON Database Engine (Zero native OS dependencies)
* **Authentication:** JSON Web Tokens (JWT), bcrypt

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Santhosh-0301/PRODIGY_FSWD_02.git
cd PRODIGY_FSWD_02
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the server
```bash
npm start
```
*The server will automatically run on `http://localhost:3000`.*

---

## 🔐 Demo Credentials

Upon the first run, the database automatically seeds itself with 1 Admin and 8 Sample Employees.

| Role | Login URL | Username / ID | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | `http://localhost:3000/admin/login.html` | `admin` | `admin@123` |
| **Employee** | `http://localhost:3000/employee/login.html` | `EMP-001` (to `EMP-008`) | `emp@123` |

---

## 📸 Screenshots

*(Feel free to add screenshots of your Admin Dashboard and Employee Profile here to showcase the beautiful UI!)*

---

### Author
**Santhosh**
*Prodigy InfoTech — Full Stack Web Development Intern*