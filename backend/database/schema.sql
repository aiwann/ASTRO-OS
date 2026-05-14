CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  encrypted_api_key TEXT,
  model TEXT DEFAULT 'claude-sonnet-4-5',
  encryption_iv TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_gender TEXT,
  birth_date TEXT NOT NULL,
  birth_time TEXT,
  birth_place TEXT NOT NULL,
  birth_lat REAL,
  birth_lon REAL,
  question TEXT,
  category TEXT,
  astrology_data TEXT,
  numerology_data TEXT,
  sections TEXT,
  full_report TEXT,
  version_history TEXT DEFAULT '[]',
  status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER NOT NULL,
  messages TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);
