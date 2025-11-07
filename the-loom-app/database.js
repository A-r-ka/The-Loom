import sqlite3 from 'sqlite3';

const verboseSqlite = sqlite3.verbose();
const DB_FILE = './the-loom-hackathon.db'; 

// Esta função vai popular nossos dados de demonstração
const seedDatabase = (db) => {
  // Usamos os dados de exemplo do seu arquivo seed.ts
  const demoProjects = [
    {
      title: 'Treinamento de Modelo CNN (Demo)',
      description: 'Treinamento de rede neural para classificação de imagens médicas.',
      type: 'AI',
      price: 2.5,
      wallet_address: '0x1234567890123456789012345678901234567890',
      status: 'PENDING',
      progress: 0,
      // Nossos novos campos (podem ser nulos para os demos)
      cloud_link: 'http://example.com/datasets/cnn-med-images.zip', 
      script_path: '/demo/cnn-script.py'
    },
    {
      title: 'Renderização 3D - Arquitetura (Demo)',
      description: 'Renderização fotorrealística de projeto arquitetônico.',
      type: '3D Rendering',
      price: 3.0,
      wallet_address: '0xabcdef123456789012345678901234567890abcd',
      status: 'PENDING',
      progress: 0,

      cloud_link: 'http://example.com/datasets/cnn-med-images.zip', 
      script_path: '/demo/cnn-script.py'
    },
    {
      title: 'Fine-tuning GPT (Demo)',
      description: 'Ajuste fino de modelo de linguagem para análise de sentimentos.',
      type: 'Data Simulation',
      price: 1.2,
      wallet_address: '0xfedcba0987654321098765432109876543210fed',
      status: 'PENDING',
      progress: 0,

      cloud_link: 'http://example.com/datasets/cnn-med-images.zip', 
      script_path: '/demo/cnn-script.py'
    }
  ];

  console.log('Banco de dados vazio. Populando com dados de demonstração...');
  const stmt = db.prepare(`
    INSERT INTO projects (title, description, type, price, wallet_address, status, progress, created_at, cloud_link, script_path) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  demoProjects.forEach(p => {
    stmt.run(
      p.title, p.description, p.type, p.price, p.wallet_address,
      p.status, p.progress, new Date().toISOString(),
      p.cloud_link || null, // Adiciona o link
      p.script_path || null // Adiciona o path
    );
  });
  
  stmt.finalize(/* ... */);
};

const db = new verboseSqlite.Database(DB_FILE, (err) => {
  // ... (código de conexão) ...
  db.serialize(() => {
    // Passo 1: Criar a tabela (Substitui o migrate.ts / schema.sql)
    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL, 
      price REAL NOT NULL,
      description TEXT,
      type TEXT NOT NULL CHECK(type IN ('AI', '3D Rendering', 'Data Simulation', 'Video Processing')),
      wallet_address TEXT,
      wallet_address_secondary TEXT,
      status TEXT DEFAULT 'PENDING' NOT NULL,
      progress INTEGER DEFAULT 0 NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Campos para links e anexos --
      cloud_link TEXT,
      script_path TEXT,
      external_links TEXT, -- Armazenado como JSON string
      attachment_info TEXT,

      -- Requisitos de hardware e software --
      cpu BOOLEAN DEFAULT 0,
      gpu BOOLEAN DEFAULT 0,
      ram INTEGER,
      vram INTEGER,

      vray BOOLEAN DEFAULT 0,
      openfoam BOOLEAN DEFAULT 0,
      bullet BOOLEAN DEFAULT 0,
      python BOOLEAN DEFAULT 0,
      compileProject BOOLEAN DEFAULT 0,
      blender BOOLEAN DEFAULT 0,
      octane BOOLEAN DEFAULT 0,
      autoDesk3DMax BOOLEAN DEFAULT 0,
      zbrush BOOLEAN DEFAULT 0
      

    )`);

    // Passo 2: Verificar se a tabela está vazia e popular (Substitui o seed.ts)
    db.get('SELECT COUNT(*) as count FROM projects', (err, row) => {
      if (err) return console.error('Erro ao contar projetos:', err.message);
      
      if (row.count === 0) {
        seedDatabase(db);
      } else {
        console.log('Banco de dados já contém dados. Povoamento ignorado.');
      }
    });
  });
});

// --- As 3 funções de Query para sua API ---
// (Exatamente como na resposta anterior)

export const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

export const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};

export const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};