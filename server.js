const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const fs        = require('fs');
const initSqlJs = require('sql.js');

const app     = express();
const PORT    = 3000;
const DB_PATH = path.join(__dirname, 'leads.db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let db;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
    console.log('✅ Loaded existing database →', DB_PATH);
  } else {
    db = new SQL.Database();
    console.log('✅ Created new database →', DB_PATH);
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT NOT NULL,
      company      TEXT,
      email        TEXT NOT NULL,
      phone        TEXT,
      service      TEXT,
      budget       TEXT,
      message      TEXT,
      submitted_at TEXT DEFAULT (datetime('now','localtime'))
    )
  `);
  saveDB();
}

function saveDB() {
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

// POST /api/contact — save a new lead
app.post('/api/contact', (req, res) => {
  const { name, company, email, phone, service, budget, message } = req.body;
  if (!name || !email) return res.status(400).json({ ok: false, error: 'Name and email required.' });

  try {
    db.run(
      `INSERT INTO leads (name, company, email, phone, service, budget, message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, company||'', email, phone||'', service||'', budget||'', message||'']
    );
    const id = db.exec('SELECT last_insert_rowid()')[0].values[0][0];
    saveDB();
    console.log(`📥 Lead #${id} — ${name} <${email}>`);
    res.json({ ok: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/leads — all leads for admin panel
app.get('/api/leads', (req, res) => {
  try {
    const result = db.exec('SELECT * FROM leads ORDER BY id DESC');
    if (!result.length) return res.json([]);
    const { columns, values } = result[0];
    res.json(values.map(row => Object.fromEntries(columns.map((c,i) => [c, row[i]]))));
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/leads/:id
app.delete('/api/leads/:id', (req, res) => {
  db.run('DELETE FROM leads WHERE id = ?', [req.params.id]);
  saveDB();
  res.json({ ok: true });
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 CyberaTech backend → http://localhost:${PORT}`);
    console.log(`   Admin panel         → http://localhost:${PORT}/admin.html\n`);
  });
});
