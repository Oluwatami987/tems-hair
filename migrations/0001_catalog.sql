CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('extensions', 'ponytails')),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  colors TEXT NOT NULL DEFAULT '[]',
  image TEXT NOT NULL,
  available INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  failed_count INTEGER NOT NULL DEFAULT 0,
  blocked_until INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO admin_login_attempts (id) VALUES (1);
INSERT OR IGNORE INTO settings (key, value) VALUES ('booking_rules', 'Tems will confirm availability, price, and any preparation instructions on WhatsApp. Your request is confirmed only after Tems replies.');
