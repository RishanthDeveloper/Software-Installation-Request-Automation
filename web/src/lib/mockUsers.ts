export type Role = 'employee' | 'manager' | 'it_support' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: Role;
}

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Ananya Rao',
    email: 'ananya@demo.local',
    initials: 'AR',
    role: 'employee',
  },
  {
    id: 'u2',
    name: 'Karthik Iyer',
    email: 'karthik@demo.local',
    initials: 'KI',
    role: 'manager',
  },
  {
    id: 'u3',
    name: 'Priya Shah',
    email: 'priya@demo.local',
    initials: 'PS',
    role: 'it_support',
  },
  {
    id: 'u4',
    name: 'Vikram Singh',
    email: 'vikram@demo.local',
    initials: 'VS',
    role: 'admin',
  }
];
