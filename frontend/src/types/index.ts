// User types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

// Role types
export interface Role {
  id: string;
  name: string;
  description: string;
}

// User Role Mapping types
export interface UserRoleMapping {
  id: string;
  username: string;
  roles: string[];
}

// Role Resource Mapping types
export interface RoleResourceMapping {
  id: string;
  role: string;
  resources: string[];
  operations: string[];
}

// API Request/Response types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user?: User | null;
}

export interface AddUserRequest {
  resourceName: string;
  authMap: {
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  };
  resourceMap: {
    user_name: string;
    user_email: string;
  };
}

export interface UserRoleMappingRequest {
  role: string;
  userName: string;
}

export interface RoleResourcePermissionRequest {
  resource: string;
  session_id?: string;
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  path?: string;
  children?: NavigationItem[];
}

// Table column types
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}