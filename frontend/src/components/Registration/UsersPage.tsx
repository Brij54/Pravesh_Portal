import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from  '../../context/DataContext'
import { User } from '../../types';
import appContentStyles from '../AppContent.module.css';
import usersPageStyles from './UsersPage.module.css';

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { users, refreshUsers, loading } = useData();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Refresh users when navigating back from add user page
  useEffect(() => {
    refreshUsers();
  }, [location.pathname]);

  useEffect(() => {
    if (users && users.length > 0) {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm, users]);

  const handleSelectAll = (checked: boolean) => {
    if (checked && Array.isArray(filteredUsers)) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleUserClick = (username: string) => {
    navigate(`/admin/users/view/${username}`);
  };

  const handleAddUser = () => {
    navigate('/admin/users/add');
  };

  const handleBulkUpload = () => {
    navigate('/admin/users/bulk-upload');
  };

if (loading) {
    return (
      <div className={appContentStyles.usersPageLoading || usersPageStyles.usersPageLoading}>
        <div className={appContentStyles.loadingSpinner || usersPageStyles.loadingSpinner}>Loading users...</div>
      </div>
    );
  }

  return (
    <div className={appContentStyles.usersPage || usersPageStyles.usersPage}>
      <div className={appContentStyles.usersHeader || usersPageStyles.usersHeader}>
        <h1 className={appContentStyles.pageTitle || usersPageStyles.pageTitle}>Users</h1>
        <div className={appContentStyles.breadcrumb || usersPageStyles.breadcrumb}>
          <span className={appContentStyles.breadcrumbItem || usersPageStyles.breadcrumbItem}>
            <button className={appContentStyles.breadcrumbLink || usersPageStyles.breadcrumbLink} onClick={() => navigate('/admin')}>IAM</button>
          </span>
          <span className={`${appContentStyles.breadcrumbItem || usersPageStyles.breadcrumbItem} ${appContentStyles.active || usersPageStyles.active}`}>Users</span>
        </div>
      </div>

      <div className={appContentStyles.usersContent || usersPageStyles.usersContent}>
        <div className={appContentStyles.usersControls || usersPageStyles.usersControls}>
          <div className={appContentStyles.searchContainer || usersPageStyles.searchContainer}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={appContentStyles.searchInput || usersPageStyles.searchInput}
            />
          </div>
          <div className={appContentStyles.actionButtons || usersPageStyles.actionButtons}>
            <button className={`${appContentStyles.btn || usersPageStyles.btn} ${appContentStyles.btnPrimary || usersPageStyles.btnPrimary}`} onClick={handleAddUser}>
              Add User
            </button>
            <button className={`${appContentStyles.btn || usersPageStyles.btn} ${appContentStyles.btnPrimary || usersPageStyles.btnPrimary}`} onClick={handleBulkUpload}>
              Bulk Upload
            </button>
          </div>
        </div>

        <div className={appContentStyles.usersTableContainer || usersPageStyles.usersTableContainer}>
          <table className={appContentStyles.usersTable || usersPageStyles.usersTable}>
            <thead>
              <tr>
                <th className={appContentStyles.checkboxColumn || usersPageStyles.checkboxColumn}>
                  <input
                    type="checkbox"
                    checked={Array.isArray(filteredUsers) && selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className={appContentStyles.sortableHeader || usersPageStyles.sortableHeader}>
                  <div className={appContentStyles.headerContent || usersPageStyles.headerContent}>
                    <span>User name</span>
                    <div className={appContentStyles.sortIcons || usersPageStyles.sortIcons}>
                      <span className={appContentStyles.sortIcon || usersPageStyles.sortIcon}>▲</span>
                      <span className={appContentStyles.sortIcon || usersPageStyles.sortIcon}>▼</span>
                    </div>
                  </div>
                </th>
                <th>Email</th>
                <th className={appContentStyles.sortableHeader || usersPageStyles.sortableHeader}>
                  <div className={appContentStyles.headerContent || usersPageStyles.headerContent}>
                    <span>First name</span>
                    <div className={appContentStyles.sortIcons || usersPageStyles.sortIcons}>
                      <span className={appContentStyles.sortIcon || usersPageStyles.sortIcon}>▲</span>
                      <span className={appContentStyles.sortIcon || usersPageStyles.sortIcon}>▼</span>
                    </div>
                  </div>
                </th>
                <th className={appContentStyles.sortableHeader || usersPageStyles.sortableHeader}>
                  <div className={appContentStyles.headerContent || usersPageStyles.headerContent}>
                    <span>Last name</span>
                    <div className={appContentStyles.sortIcons || usersPageStyles.sortIcons}>
                      <span className={appContentStyles.sortIcon || usersPageStyles.sortIcon}>▲</span>
                      <span className={appContentStyles.sortIcon || usersPageStyles.sortIcon}>▼</span>
                    </div>
                  </div>
                </th>
                <th>Roles</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredUsers) && filteredUsers.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? (appContentStyles.rowEven || usersPageStyles.rowEven) : (appContentStyles.rowOdd || usersPageStyles.rowOdd)}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <button
                      className={appContentStyles.userLink || usersPageStyles.userLink}
                      onClick={() => handleUserClick(user.username)}
                    >
                      {user.username}
                    </button>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.firstName || '-'}</td>
                  <td>{user.lastName || '-'}</td>
                  <td>
                    <div className={appContentStyles.rolesContainer || usersPageStyles.rolesContainer}>
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role: string, roleIndex: number) => (
                          <span key={roleIndex} className={appContentStyles.roleTag || usersPageStyles.roleTag}>
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className={appContentStyles.noRoles || usersPageStyles.noRoles}>No roles assigned</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;