
import axios,{AxiosResponse } from 'axios';
import {
  LoginRequest,
  LoginResponse,
  AddUserRequest,
  UserRoleMappingRequest,
  RoleResourcePermissionRequest,
  ApiResponse,
  User,
  Role,
  UserRoleMapping,
  RoleResourceMapping
} from '../types';

const BASE_URL = 'http://localhost:8082/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',

  },
  withCredentials: true, // Handle CORS with credentials
});

// Helper function to get token from cookie
const getTokenFromCookie = (cookieName: string): string | null => {
  const cookies = document.cookie.split(';');
  const cookie = cookies.find(c => c.trim().startsWith(`${cookieName}=`));
  if (cookie) {
    return cookie.split('=')[1];
  }
  return null;
};

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config:any) => {
  // Skip adding Authorization header for login and refresh endpoints
  const isAuthEndpoint = config.url?.includes('/auth/login') || 
                        config.url?.includes('/auth/refresh');
  
  if (isAuthEndpoint) {
    // For login/refresh, don't add Authorization header
    return config;
  }
  
  // Try to get token from cookie first (primary source)
  let token = getTokenFromCookie('access_token');
  
  // Fallback to localStorage if not in cookie
  if (!token) {
    token = localStorage.getItem('authToken');
  }
  
  console.log('Request interceptor - token from cookie:', token ? 'Found' : 'Not found');
  console.log('Request URL:', config.url);
  console.log('Request method:', config.method);
  
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header set');
  } else {
    console.log('No valid token found in cookie or localStorage');
    console.log('Available localStorage keys:', Object.keys(localStorage));
    console.log('Available cookies:', document.cookie);
  }
  return config;
});

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add response interceptor to handle CORS errors and token refresh
apiClient.interceptors.response.use(
  (response:any) => response,
  async (error:any) => {
    const originalRequest = error.config;

    // Skip retry if this is already a retry attempt or refresh request
    if (originalRequest._retry || originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      console.error('CORS Error:', error);
    }
    
    // Handle 401 Unauthorized or 403 Forbidden - token expired or invalid
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log(`${error.response.status} Unauthorized/Forbidden - Token may be expired`);
      console.log('Response headers:', error.response.headers);
      
      // Check if it's a token expiration error (but don't require it)
      const wwwAuthenticate = error.response.headers['www-authenticate'] || 
                               error.response.headers['WWW-Authenticate'];
      const isTokenExpired = wwwAuthenticate?.includes('Jwt expired') || 
                            wwwAuthenticate?.includes('expired') ||
                            error.response.status === 401; // Assume 401 means token expired
      
      if (isTokenExpired) {
        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        // Try to get refresh token from cookie first, then localStorage
        let refreshToken = getTokenFromCookie('refresh_token');
        if (!refreshToken) {
          refreshToken = localStorage.getItem('refreshToken');
        }
        
        if (!refreshToken || refreshToken === 'undefined' || refreshToken === 'null') {
          console.log('No refresh token available in cookie or localStorage - redirecting to login');
          isRefreshing = false;
          processQueue(new Error('No refresh token'), null);
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/admin/login';
          return Promise.reject(new Error('Token expired - please login again'));
        }

        try {
          console.log('Attempting token refresh...');
          
          // Make a request to refresh the token
          // Note: Tokens are stored in cookies, so we don't need to send refresh_token in body
          const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true // Important: sends cookies with request
          });
          
          console.log('Token refresh response:', refreshResponse.data);
          
          // Extract tokens from cookies (tokens are stored in cookies, not response body)
          const cookies = document.cookie.split(';');
          const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
          const refreshTokenCookie = cookies.find(cookie => cookie.trim().startsWith('refresh_token='));
          
          let newAccessToken = '';
          let newRefreshToken = '';
          
          if (accessTokenCookie) {
            newAccessToken = accessTokenCookie.split('=')[1];
          }
          if (refreshTokenCookie) {
            newRefreshToken = refreshTokenCookie.split('=')[1];
          }
          
          console.log('Access token from cookie:', newAccessToken ? 'Found' : 'Not found');
          console.log('Refresh token from cookie:', newRefreshToken ? 'Found' : 'Not found');
          
          // Also check response body as fallback (in case backend sends tokens in both places)
          if (!newAccessToken && refreshResponse.data) {
            if (typeof refreshResponse.data === 'string') {
              try {
                const parsed = JSON.parse(refreshResponse.data);
                newAccessToken = parsed.access_token || parsed.accessToken;
                newRefreshToken = parsed.refresh_token || parsed.refreshToken;
              } catch {
                console.warn('Refresh response is a string, cannot extract token');
              }
            } else {
              newAccessToken = refreshResponse.data.access_token || 
                             refreshResponse.data.accessToken ||
                             refreshResponse.data.token;
              newRefreshToken = refreshResponse.data.refresh_token || 
                              refreshResponse.data.refreshToken;
            }
          }
          
          if (newAccessToken) {
            // Update the stored token in localStorage (for backward compatibility)
            localStorage.setItem('authToken', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            
            console.log('Token refreshed successfully');
            isRefreshing = false;
            
            // Process queued requests
            processQueue(null, newAccessToken);
            
            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          } else {
            throw new Error('No access token found in cookies or response after refresh');
          }
        } catch (refreshError: any) {
          console.error('Token refresh failed:', refreshError);
          isRefreshing = false;
          
          // Process queued requests with error
          processQueue(refreshError, null);
          
          // If refresh fails, redirect to login
          console.log('Token refresh failed - redirecting to login');
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Only redirect if not already on login page
          if (window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
          
          return Promise.reject(new Error('Token expired - please login again'));
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response: AxiosResponse<any> = await apiClient.post('/auth/login', credentials);
    
    // Extract tokens from cookies if response body is empty
    const cookies = document.cookie.split(';');
    const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
    const refreshTokenCookie = cookies.find(cookie => cookie.trim().startsWith('refresh_token='));
    
    let accessToken = '';
    let refreshToken = '';
    
    if (accessTokenCookie) {
      accessToken = accessTokenCookie.split('=')[1];
    }
    if (refreshTokenCookie) {
      refreshToken = refreshTokenCookie.split('=')[1];
    }
    
    console.log('Login response data:', response.data);
    console.log('Access token from cookie:', accessToken);
    console.log('Refresh token from cookie:', refreshToken);
    
    // Store refresh token in localStorage if available
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
      console.log('Refresh token stored in localStorage');
    }
    
    // Return the response with tokens from cookies
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: response.data?.user || null
    };
  },

  addUser: async (userData: AddUserRequest): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/auth/add_user', userData);
    return response.data;
  },

  addClientRole: async (roleName: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post(`/auth/add-client-role?roleName=${roleName}`);
    return response.data;
  },

  userRoleMapping: async (mapping: UserRoleMappingRequest): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/auth/user_role_mapping', mapping);
    return response.data;
  },

  getRoles: async (): Promise<string[]> => {
    const response: AxiosResponse<string[]> = await apiClient.get('/auth/role',
      {
        params: {
          queryId: 'GET_ALL'
        }
      }
    );
    return response.data;
  },
};

// User API
export const userAPI = {
  getUsers: async (): Promise<User[]> => {
    console.log('Making getUsers API call...');
    console.log('Current token in localStorage:', localStorage.getItem('authToken'));
    
    const response: AxiosResponse<any> = await apiClient.get('/auth/users-with-roles',
      {
        params: {
          queryId: 'GET_ALL'
        }
      }
    );
    
    console.log('Users API response status:', response.status);
    console.log('Users API response headers:', response.headers);
    console.log('Users API response data:', response.data);
    console.log('Response data type:', typeof response.data);
    console.log('Is array:', Array.isArray(response.data));
    
    // Handle the new API response format
    if (Array.isArray(response.data)) {
      // Transform the API response to match our User interface
      const users = response.data.map((item: any) => {
        // Extract all role names from clientRoles
        const allRoles: string[] = [];
        
        // Add realm roles
        if (item.realmRoles && Array.isArray(item.realmRoles)) {
          item.realmRoles.forEach((role: any) => {
            allRoles.push(role.name);
          });
        }
        
        // Add client roles
        if (item.clientRoles && typeof item.clientRoles === 'object') {
          Object.keys(item.clientRoles).forEach(clientName => {
            const clientRole = item.clientRoles[clientName];
            if (clientRole.mappings && Array.isArray(clientRole.mappings)) {
              clientRole.mappings.forEach((mapping: any) => {
                allRoles.push(`${clientName}:${mapping.name}`);
              });
            }
          });
        }
        
        return {
          id: item.id,
          username: item.username,
          email: item.email,
          firstName: item.firstName || '',
          lastName: item.lastName || '',
          roles: allRoles
        };
      });
      
      console.log('Transformed users:', users);
      return users;
    } else {
      console.warn('Unexpected API response format:', response.data);
      return [];
    }
  },

  updateUser: async (userId: string, userData: Partial<User>): Promise<ApiResponse<any>> => {
    console.log('Updating user:', userId, userData);
    
    // Transform the data to match backend expectations
    const requestData = {
      updatedFields: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        enabled: true
      },
      assignRoles: userData.roles || [],
      removeRoles: [] // We'll need to handle this based on current vs new roles
    };
    
    console.log('Sending request data:', requestData);
    
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.put(`/auth/update-user/${userId}`, requestData);
    
    console.log('Update user response:', response.data);
    return response.data;
  },

  removeUserRole: async (userId: string, user: User, roleToRemove: string): Promise<ApiResponse<any>> => {
    console.log('Removing role from user:', userId, roleToRemove);
    
    // Calculate remaining roles after removal
    const remainingRoles = (user.roles || []).filter(role => role !== roleToRemove);
    
    // Transform the data to match backend expectations
    const requestData = {
      updatedFields: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        enabled: true
      },
      assignRoles: remainingRoles,
      removeRoles: [roleToRemove]
    };
    
    console.log('Sending remove role request data:', requestData);
    
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.put(`/auth/update-user?queryId=MODIFY&userId=${userId}`, requestData);
    
    console.log('Remove role response:', response.data);
    return response.data;
  },
};

// Role Resource Permission API
export const roleResourceAPI = {
  getAllResources: async (): Promise<string[]> => {
    const response: AxiosResponse<string[]> = await apiClient.get('/GetAllResource');
    return response.data;
  },

  getAllRoleResourceMappings: async (): Promise<any> => {
    const response: AxiosResponse<any> = await apiClient.get('/role_resource_permission?queryId=GET_ALL');
    return response.data;
  },

  getRoleResourcePermissions: async (roleName: string): Promise<any> => {
    const response: AxiosResponse<any> = await apiClient.get(`/role_resource_permission?queryId=GET_ALL&filter=role:${roleName}`);
    return response.data;
  },

  setPermission: async (permission: RoleResourcePermissionRequest): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('resource', permission.resource);
    if (permission.session_id) {
      formData.append('session_id', permission.session_id);
    }

    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/role_resource_permission', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateRoleResourcePermission: async (role: string, resource: string, actions: string[], action: string): Promise<ApiResponse<any>> => {
    // Build the JSON payload
    const payload = {
      role: role,
      resource: resource,
      action: actions
    };
    
    // Base64 encode the JSON payload
    const base64Payload = btoa(JSON.stringify(payload));
    
    // Create FormData
    const formData = new FormData();
    formData.append('resource', base64Payload);
    formData.append('action', action);

    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/role_resource_permission', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  setResourceRoleType: async (resource: string, sessionId?: string): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('resource', resource);
    if (sessionId) {
      formData.append('session_id', sessionId);
    }

    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/res_role_type', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
};

// Issue API
export const issueAPI = {
  createIssue: async (resource: string): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('resource', resource);

    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/issue', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
};

// Mock data services (for development/testing)
export const mockDataAPI = {
  getUsers: async (): Promise<User[]> => {
    // Mock data based on the dashboard image
    return [
      { id: '1', username: 'User1', email: 'user1@gmail.com', firstName: 'User', lastName: '1' },
      { id: '2', username: 'User2', email: 'user2@gmail.com', firstName: 'User', lastName: '2' },
      { id: '3', username: 'User3', email: 'user3@gmail.com', firstName: 'User', lastName: '3' },
      { id: '4', username: 'User4', email: 'user4@gmail.com', firstName: 'User', lastName: '4' },
      { id: '5', username: 'User5', email: 'user5@gmail.com', firstName: 'User', lastName: '5' },
      { id: '6', username: 'User6', email: 'user6@gmail.com', firstName: 'User', lastName: '6' },
      { id: '7', username: 'User7', email: 'user7@gmail.com', firstName: 'User', lastName: '7' },
      { id: '8', username: 'User8', email: 'user8@gmail.com', firstName: 'User', lastName: '8' },
    ];
  },


  getUserRoleMappings: async (): Promise<UserRoleMapping[]> => {
    return [
      { id: '1', username: 'User1', roles: ['Role1', 'Role3'] },
      { id: '2', username: 'User2', roles: ['Role1', 'Role2'] },
      { id: '3', username: 'User3', roles: ['Role2'] },
      { id: '4', username: 'User4', roles: ['Role2'] },
      { id: '5', username: 'User5', roles: ['Role2'] },
      { id: '6', username: 'User6', roles: ['Role4'] },
      { id: '7', username: 'User7', roles: ['Role4'] },
      { id: '8', username: 'User8', roles: ['Role1'] },
    ];
  },

  getRoleResourceMappings: async (): Promise<RoleResourceMapping[]> => {
    return [
      { id: '1', role: 'Role1', resources: ['Resource1'], operations: ['CRUD'] },
      { id: '2', role: 'Role1', resources: ['Resource3'], operations: ['RU'] },
      { id: '3', role: 'Role2', resources: ['Resource1'], operations: ['CRD'] },
      { id: '4', role: 'Role2', resources: ['Resource2'], operations: ['CR'] },
      { id: '5', role: 'Role2', resources: ['Resource4'], operations: ['D'] },
      { id: '6', role: 'Role3', resources: ['Resource2'], operations: ['R'] },
      { id: '7', role: 'Role4', resources: ['Resource2'], operations: ['CRU'] },
      { id: '8', role: 'Role4', resources: ['Resource3'], operations: ['D'] },
    ];
  },

  // Get detailed role resource permissions (for the detail view)
  getRoleResourcePermissions: async (roleName: string): Promise<any> => {
    const allResources = [
      'Resource Name 1', 'Resource Name 2', 'Resource Name 3', 'Resource Name 4', 'Resource Name 5',
      'Resource Name 6', 'Resource Name 7', 'Resource Name 8', 'Resource Name 9', 'Resource Name 10', 'Resource Name 11'
    ];

    // Mock permissions based on the design image
    const mockPermissions: { [key: string]: any } = {
      'ExampleRole1': {
        'Resource Name 1': { create: false, read: true, update: false, delete: false },
        'Resource Name 2': { create: false, read: true, update: false, delete: true },
        'Resource Name 3': { create: true, read: true, update: true, delete: true },
        'Resource Name 4': { create: false, read: true, update: false, delete: false },
        'Resource Name 5': { create: true, read: true, update: true, delete: true },
        'Resource Name 6': { create: false, read: true, update: false, delete: true },
        'Resource Name 7': { create: true, read: true, update: true, delete: true },
        'Resource Name 8': { create: false, read: true, update: false, delete: true },
        'Resource Name 9': { create: true, read: true, update: true, delete: false },
        'Resource Name 10': { create: false, read: true, update: false, delete: true },
        'Resource Name 11': { create: false, read: true, update: true, delete: false },
      },
      'ExampleRole2': {
        'Resource Name 1': { create: true, read: true, update: false, delete: false },
        'Resource Name 2': { create: false, read: false, update: true, delete: true },
        'Resource Name 3': { create: true, read: false, update: true, delete: true },
        'Resource Name 4': { create: false, read: true, update: true, delete: false },
        'Resource Name 5': { create: true, read: true, update: false, delete: true },
        'Resource Name 6': { create: false, read: true, update: false, delete: false },
        'Resource Name 7': { create: true, read: false, update: true, delete: true },
        'Resource Name 8': { create: false, read: true, update: false, delete: true },
        'Resource Name 9': { create: true, read: true, update: true, delete: false },
        'Resource Name 10': { create: false, read: false, update: false, delete: true },
        'Resource Name 11': { create: true, read: true, update: true, delete: false },
      }
    };

    return {
      role: roleName,
      resources: allResources.map(resource => ({
        name: resource,
        permissions: mockPermissions[roleName]?.[resource] || { create: false, read: false, update: false, delete: false }
      }))
    };
  },

  // Get roles with descriptions for the list view
  getRolesWithDescriptions: async (): Promise<any[]> => {
    return [
      { id: '1', name: 'ExampleRole1', description: 'Example Rule 1 Description' },
      { id: '2', name: 'ExampleRole2', description: 'Example Rule 2 Description' },
      { id: '3', name: 'Role1', description: 'lorem' },
      { id: '4', name: 'Role2', description: 'lorem' },
      { id: '5', name: 'Role3', description: 'lorem' },
      { id: '6', name: 'Role4', description: 'lorem' },
    ];
  },
};

export default apiClient;