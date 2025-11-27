export interface User {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  active: boolean;
  roleIds: number[];
  domain: string;
}

export interface Role {
  id: number;
  name: string;
  permissionIds: number[];
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
}
