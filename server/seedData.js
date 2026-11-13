import bcrypt from 'bcryptjs';

export const DEPARTMENTS = ['Engineering', 'Finance', 'Marketing', 'Operations'];

export const USERS = [
  { name: 'System Admin', email: 'admin@example.com', role: 'admin', department: 'Operations' },
  { name: 'Ravi Kumar', email: 'ravi.kumar@example.com', role: 'manager', department: 'Engineering' },
  { name: 'Meera Nair', email: 'meera.nair@example.com', role: 'manager', department: 'Finance' },
  { name: 'Arjun Patel', email: 'arjun.patel@example.com', role: 'it_support', department: 'Operations' },
  { name: 'Divya Shankar', email: 'divya.shankar@example.com', role: 'it_support', department: 'Operations' },
  { name: 'Sneha Reddy', email: 'sneha.reddy@example.com', role: 'employee', department: 'Engineering' },
  { name: 'Karan Mehta', email: 'karan.mehta@example.com', role: 'employee', department: 'Finance' },
];

// [name, vendor, category, requires license, license count (null = unlimited)]
export const SOFTWARE = [
  ['Visual Studio Code', 'Microsoft', 'Development', false, null],
  ['Git', 'Git project', 'Development', false, null],
  ['Python 3.12', 'Python Software Foundation', 'Development', false, null],
  ['Postman', 'Postman', 'Development', false, null],
  ['Docker Desktop', 'Docker', 'Development', true, 20],
  ['IntelliJ IDEA Ultimate', 'JetBrains', 'Development', true, 10],
  ['Microsoft Visio', 'Microsoft', 'Office', true, 8],
  ['Adobe Acrobat Pro', 'Adobe', 'Office', true, 15],
  ['Tableau Desktop', 'Salesforce', 'Analytics', true, 4],
  ['Power BI Desktop', 'Microsoft', 'Analytics', false, null],
  ['Adobe Photoshop', 'Adobe', 'Design', true, 3],
  ['Zoom Workplace', 'Zoom', 'Communication', false, null],
];

// Inserts reference data and starter accounts. Existing rows are left alone,
// so running it twice is safe.
export function seedDatabase(db, password) {
  const hash = bcrypt.hashSync(password, 10);

  db.transaction(() => {
    const addDept = db.prepare('INSERT OR IGNORE INTO departments (name) VALUES (?)');
    DEPARTMENTS.forEach((name) => addDept.run(name));

    const deptId = (name) => db.prepare('SELECT id FROM departments WHERE name = ?').get(name).id;
    const addUser = db.prepare(
      'INSERT OR IGNORE INTO users (name, email, password_hash, role, department_id) VALUES (?, ?, ?, ?, ?)',
    );
    USERS.forEach((u) => addUser.run(u.name, u.email, hash, u.role, deptId(u.department)));

    const addSoftware = db.prepare(
      'INSERT OR IGNORE INTO software (name, vendor, category, requires_license, license_count) VALUES (?, ?, ?, ?, ?)',
    );
    SOFTWARE.forEach(([name, vendor, category, licensed, count]) =>
      addSoftware.run(name, vendor, category, licensed ? 1 : 0, count),
    );
  })();
}
