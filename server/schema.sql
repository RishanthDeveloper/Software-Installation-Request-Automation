-- Database schema. Every statement is idempotent, so this file runs on each start.
-- Timestamps are ISO-8601 strings in UTC (e.g. 2026-11-12T09:30:00.000Z).

CREATE TABLE IF NOT EXISTS departments (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS users (
  id             INTEGER PRIMARY KEY,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'employee'
                 CHECK (role IN ('employee', 'manager', 'it_support', 'admin')),
  department_id  INTEGER REFERENCES departments(id),
  is_active      INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS software (
  id                INTEGER PRIMARY KEY,
  name              TEXT NOT NULL UNIQUE COLLATE NOCASE,
  vendor            TEXT NOT NULL,
  category          TEXT NOT NULL,
  requires_license  INTEGER NOT NULL DEFAULT 0 CHECK (requires_license IN (0, 1)),
  license_count     INTEGER CHECK (license_count IS NULL OR license_count >= 0), -- NULL means unlimited
  is_active         INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS requests (
  id                  INTEGER PRIMARY KEY,
  user_id             INTEGER NOT NULL REFERENCES users(id),
  software_id         INTEGER NOT NULL REFERENCES software(id),
  department_id       INTEGER NOT NULL REFERENCES departments(id), -- requester's department when submitted
  version             TEXT NOT NULL DEFAULT '',
  device_tag          TEXT NOT NULL,
  justification       TEXT NOT NULL,
  urgency             TEXT NOT NULL CHECK (urgency IN ('low', 'normal', 'high')),
  needed_by           TEXT,
  status              TEXT NOT NULL DEFAULT 'pending_manager'
                      CHECK (status IN ('pending_manager', 'pending_it', 'in_progress',
                                        'installed', 'closed', 'rejected', 'cancelled')),
  manager_id          INTEGER REFERENCES users(id),
  manager_decided_at  TEXT,
  it_approver_id      INTEGER REFERENCES users(id),
  it_decided_at       TEXT,
  assigned_to         INTEGER REFERENCES users(id),
  installed_at        TEXT,
  install_notes       TEXT,
  closed_at           TEXT,
  rejection_reason    TEXT,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_requests_user ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_department ON requests(department_id, status);
CREATE INDEX IF NOT EXISTS idx_requests_software ON requests(software_id, status);

-- A person can only have one open request for the same software.
CREATE UNIQUE INDEX IF NOT EXISTS uq_requests_one_open
  ON requests(user_id, software_id)
  WHERE status IN ('pending_manager', 'pending_it', 'in_progress', 'installed');

CREATE TABLE IF NOT EXISTS request_events (
  id           INTEGER PRIMARY KEY,
  request_id   INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  actor_id     INTEGER NOT NULL REFERENCES users(id),
  action       TEXT NOT NULL,
  from_status  TEXT,
  to_status    TEXT NOT NULL,
  note         TEXT,
  created_at   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_request_events_request ON request_events(request_id, created_at);

-- Target hours from submission to installation, per urgency.
CREATE TABLE IF NOT EXISTS sla_targets (
  urgency  TEXT PRIMARY KEY CHECK (urgency IN ('low', 'normal', 'high')),
  hours    INTEGER NOT NULL CHECK (hours > 0)
);

INSERT OR IGNORE INTO sla_targets (urgency, hours) VALUES ('high', 24), ('normal', 72), ('low', 120);

-- Admin actions and account events.
CREATE TABLE IF NOT EXISTS audit_log (
  id          INTEGER PRIMARY KEY,
  actor_id    INTEGER REFERENCES users(id),
  action      TEXT NOT NULL,
  target      TEXT,
  details     TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
