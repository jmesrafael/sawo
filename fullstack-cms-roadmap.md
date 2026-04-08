# Fullstack CMS (React + Express.js + MySQL) – Beginner Roadmap & Notes

---

## 1. Project Overview

- **Frontend:** React (user interface)
- **Backend:** Express.js (Node.js) – API, authentication, user roles
- **Database:** MySQL (records & user data)

---

## 2. Prerequisites

- **Node.js & npm** (https://nodejs.org/)
- **MySQL** (https://dev.mysql.com/downloads/)
- **Code Editor:** VS Code (recommended)
- **Postman/Insomnia:** For API testing (optional, but helpful)

---

## 3. Project Folder Structure

```plaintext
cms-project/
  backend/
  frontend/
```

---

## 4. Backend Setup (Express.js + MySQL)

### a. Create Backend Folder

```bash
mkdir cms-project
cd cms-project
mkdir backend
cd backend
```

### b. Initialize Node.js Project

```bash
npm init -y
```

### c. Install Dependencies

```bash
npm install express mysql2 cors dotenv jsonwebtoken bcryptjs
npm install --save-dev nodemon
```

- **express:** Web framework
- **mysql2:** MySQL database connector
- **cors:** For cross-origin requests (React → Express)
- **dotenv:** Manage environment variables
- **jsonwebtoken:** For authentication
- **bcryptjs:** Password hashing

### d. Create Basic Files and Folders

```plaintext
backend/
  app.js
  .env
  routes/
  controllers/
  models/
```

- **app.js:** Main entry file
- **.env:** Store secrets (DB info, JWT secret)
- **routes/:** API endpoints
- **controllers/:** Route logic
- **models/:** Database queries

### e. Sample .env File

```ini
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=cms_db
JWT_SECRET=your_jwt_secret
```

---

## 5. MySQL Database Setup

### a. Create Database and Tables

Log into MySQL with your command line tool or MySQL Workbench:

```sql
CREATE DATABASE cms_db;
USE cms_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer'
);

CREATE TABLE records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 6. Backend Coding – Key Notes

- **Express:** Set up REST API endpoints (CRUD for records, login/register for users)
- **JWT:** Use for authentication
- **bcryptjs:** Hash passwords before storing in DB
- **dotenv:** Load secrets from `.env`
- **MySQL2:** Use for DB connection and queries

---

## 7. Frontend Setup (React)

### a. Create Frontend Folder & App

From the root `cms-project` folder:

```bash
npx create-react-app frontend
cd frontend
npm install axios react-router-dom
```

- **axios:** For making HTTP requests to backend
- **react-router-dom:** Routing/navigation

---

## 8. Frontend Coding – Key Notes

- **Pages/Components:** Login, Dashboard, Records List, Record Form (edit/add)
- **React Router:** For navigation between pages
- **Axios:** For calling backend API
- **Authentication:** Store JWT token in localStorage, check for login status

---

## 9. Example Folder Structure

```plaintext
cms-project/
  backend/
    app.js
    .env
    routes/
    controllers/
    models/
  frontend/
    src/
      components/
      pages/
      App.js
      index.js
```

---

## 10. Running Your Apps

### Backend

```bash
cd cms-project/backend
npx nodemon app.js
```

### Frontend

```bash
cd cms-project/frontend
npm start
```

---

## 11. Development Tips

- **Start simple:** Get backend + database working first (test with Postman)
- **Build authentication:** Register/login, password hashing, JWT token
- **Add CRUD for records:** Create, Read, Update, Delete
- **Frontend after backend:** Build React components to call your backend API
- **Use version control:** (git) to track your progress

---

## 12. Learning Path

- Build and test each part separately.
- Ask for help on any step you’re stuck.
- Google errors – every dev gets stuck, it’s normal!
- Read docs for each library (Express, React, MySQL2, etc.)
- Practice is the best way to learn.

---

## 13. Useful Resources

- [Node.js Docs](https://nodejs.org/en/docs)
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MySQL Docs](https://dev.mysql.com/doc/)
- [JWT Guide](https://jwt.io/introduction/)
- [bcryptjs Guide](https://www.npmjs.com/package/bcryptjs)
- [dotenv Guide](https://www.npmjs.com/package/dotenv)

---

**Keep this file as your main reference and checklist!  
Ask for help here on any step and I’ll walk you through it.**
