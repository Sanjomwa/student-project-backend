const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const db = new sqlite3.Database('database.db');

app.use(cors());
app.use(bodyParser.json());
// Add this after app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.send('Welcome to the Project Management API');
});
// Initialize database tables
db.run('CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY, title TEXT, description TEXT)', (err) => {
  if (err) console.error('Error creating projects table:', err.message);
});
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT, password TEXT, name TEXT)', (err) => {
  if (err) console.error('Error creating users table:', err.message);
});

// Sample project data (optional, for testing)
db.run('INSERT OR IGNORE INTO projects (id, title, description) VALUES (?, ?, ?)', [1, 'GreenLeaf Cafe Website', 'Build a website for a cafe using HTML/CSS/JS'], (err) => {
  if (err) console.error('Error inserting project:', err.message);
});

app.get('/api/projects', (req, res) => {
  db.all('SELECT * FROM projects', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/signup', (req, res) => {
  const { email, password, name } = req.body;
  db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, password, name], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, email, name });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ id: row.id, email: row.email, name: row.name });
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running");
});
