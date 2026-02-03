
export enum UserRole {
  ADMIN = 'Quản trị viên',
  STAFF = 'Cán bộ'
}

export interface User {
  id: string;
  fullName: string;
  position: string;
  email: string;
  phone: string;
  username: string;
  password?: string;
  role: UserRole;
}

export interface Voter {
  id: string;
  fullName: string;
  idCard: string; // CCCD
  neighborhood: string; // Khu phố
  constituency: string; // Đơn vị bầu cử
  votingGroup: string; // Tổ bầu cử
  votingArea: string; // Khu vực bỏ phiếu
  hasVoted: boolean;
  votedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
