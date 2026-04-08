# Database Collation Documentation for SAWOJS

## Recommended Collation

For the **SAWOJS** project, the recommended collation for your MySQL database and tables is:

**utf8mb4_unicode_ci**

---

## Why utf8mb4_unicode_ci?

- **utf8mb4** supports all Unicode characters, including emojis and symbols.
- **unicode_ci** is case-insensitive and accent-insensitive, making searches and comparisons more flexible and user-friendly.
- This is the modern standard for global applications.

---

## How to Set Collation

### When Creating the Database

```sql
CREATE DATABASE cms_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### When Creating Tables

You can specify the charset and collation at the table level (optional if the database already uses utf8mb4_unicode_ci):

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### When Creating Columns

You can also set collation per column if needed:

```sql
username VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
```

---

## How to Check or Change Collation in Laragon

1. **Using phpMyAdmin:**
   - Go to your database.
   - Click "Operations."
   - Under "Collation," select `utf8mb4_unicode_ci` and save.

2. **Using SQL:**
   - To alter an existing database:
     ```sql
     ALTER DATABASE cms_db CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
     ```
   - To alter an existing table:
     ```sql
     ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```

---

## Summary

- **Always use `utf8mb4_unicode_ci`** for new projects for full Unicode support.
- Set collation at the database level for consistency.
- All SQL examples and setup scripts in this project assume this collation.

---

**References:**
- [MySQL Character Sets and Collations](https://dev.mysql.com/doc/refman/8.0/en/charset-unicode-sets.html)
- [utf8mb4 vs utf8](https://stackoverflow.com/questions/22226326/what-does-utf8mb4-mean)




1. Make Sure Your Database Is Ready
Start Laragon.
Open phpMyAdmin or your preferred GUI (HeidiSQL is great and is included in Laragon).
Create your database (if you haven’t already):
SQL

CREATE DATABASE cms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
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