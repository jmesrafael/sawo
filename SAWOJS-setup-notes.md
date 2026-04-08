# SAWOJS Fullstack CMS Setup Notes

These notes will guide you through setting up your SAWOJS fullstack CMS project using React (frontend), Express.js (backend), and MySQL (database) step-by-step.

---

## 1. Repository Structure

Your project should look like this:

```plaintext
SAWOJS/
  backend/
  frontend/
  README.md
  .gitignore
```

---

## 2. Backend Setup (Express.js + MySQL)

1. **Navigate to your project root and create the backend folder:**
    ```bash
    cd SAWOJS
    mkdir backend
    cd backend
    ```

2. **Initialize Node.js project:**
    ```bash
    npm init -y
    ```

3. **Install backend dependencies:**
    ```bash
    npm install express mysql2 cors dotenv jsonwebtoken bcryptjs
    npm install --save-dev nodemon
    ```

    - `express`: Web server framework
    - `mysql2`: MySQL connector
    - `cors`: Enable frontend-backend communication
    - `dotenv`: For environment variables
    - `jsonwebtoken`: For user authentication (JWT)
    - `bcryptjs`: For password hashing
    - `nodemon`: Dev tool for auto-restarting server

4. **Create backend file structure:**
    ```plaintext
    backend/
      app.js
      .env
      routes/
      controllers/
      models/
    ```

    - `app.js`: Main server file
    - `.env`: Environment variables (keep DB credentials safe)
    - `routes/`: For route definitions
    - `controllers/`: For route handler logic
    - `models/`: For database queries

5. **Sample `.env` file:**
    ```
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=yourpassword
    DB_NAME=cms_db
    JWT_SECRET=your_jwt_secret
    ```

---

## 3. MySQL Database Setup

1. **Create database and tables:**

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

## 4. Frontend Setup (React)

1. **From your project root, create the frontend app:**
    ```bash
    npx create-react-app frontend
    cd frontend
    npm install axios react-router-dom
    ```

    - `axios`: For HTTP requests to your backend API
    - `react-router-dom`: For navigation/routing

---

## 5. Folder Structure Reference

```plaintext
SAWOJS/
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

## 6. Basic Development Workflow

- **Start backend:**  
  In `SAWOJS/backend`  
  ```bash
  npx nodemon app.js
  ```

- **Start frontend:**  
  In `SAWOJS/frontend`  
  ```bash
  npm start
  ```

---

## 7. General Tips

- Work on backend API and DB first, test with Postman or Insomnia.
- Build authentication and CRUD features step by step.
- Use `.env` for secrets, never hardcode passwords.
- Use version control (`git`).
- When stuck, search documentation or ask for help.

---

## 8. Useful Links

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [MySQL](https://dev.mysql.com/doc/)
- [JWT Intro](https://jwt.io/introduction/)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [dotenv](https://www.npmjs.com/package/dotenv)

---

Keep these notes as your main reference while working on SAWOJS!
Ask for help here for any step and get detailed guidance.