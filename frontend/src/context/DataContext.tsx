import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { User, Role } from '../types';
import { authAPI, userAPI } from '../apis/authApis';

interface DataContextType {
  users: User[];
  roles: Role[];
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  refreshRoles: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const usersData = await userAPI.getUsers();
      const usersArray = Array.isArray(usersData) ? usersData : [];
      setUsers(usersArray);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesStrings = await authAPI.getRoles();
      const rolesData: Role[] = rolesStrings.map((roleName:any, index:any) => ({
        id: (index + 1).toString(),
        name: roleName,
        description: ''
      }));
      setRoles(rolesData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      setError(err.message || 'Failed to fetch roles');
      setRoles([]);
    }
  };

  const refreshUsers = async () => {
    await fetchUsers();
  };

  const refreshRoles = async () => {
    await fetchRoles();
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchRoles()]);
    setLoading(false);
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchRoles()]);
      setLoading(false);
    };

    initializeData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        users,
        roles,
        loading,
        error,
        refreshUsers,
        refreshRoles,
        refreshAll
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};




