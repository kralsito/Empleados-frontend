export interface User {
  id: number;
  email: string;
  role: UserRole;
}

export type UserRole = 'ADMIN' | 'USER';
