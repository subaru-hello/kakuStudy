CREATE TABLE users (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT UNIQUE,
  auth_state TEXT NOT NULL DEFAULT 'anonymous',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  platform TEXT NOT NULL,
  app_version TEXT,
  last_seen_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE study_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  title TEXT,
  image_object_key TEXT NOT NULL,
  image_sha256 TEXT,
  image_width INTEGER,
  image_height INTEGER,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE INDEX idx_study_items_user_updated
  ON study_items(user_id, updated_at);

CREATE TABLE study_masks (
  id TEXT PRIMARY KEY,
  study_item_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  x1 REAL NOT NULL,
  y1 REAL NOT NULL,
  x2 REAL NOT NULL,
  y2 REAL NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (study_item_id) REFERENCES study_items(id)
);

CREATE INDEX idx_study_masks_item_sort
  ON study_masks(study_item_id, sort_order);

CREATE TABLE study_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  study_item_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  revealed_count INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (study_item_id) REFERENCES study_items(id),
  FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE INDEX idx_study_sessions_user_created
  ON study_sessions(user_id, created_at);

CREATE TABLE entitlements (
  user_id TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  plan_code TEXT,
  expires_at TEXT,
  grace_until TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE sync_ops (
  op_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_revision INTEGER NOT NULL,
  received_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (device_id) REFERENCES devices(id)
);

CREATE INDEX idx_sync_ops_user_received
  ON sync_ops(user_id, received_at);
