import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useData } from '../../context/DataContext';
import { toast } from '../../utils/toast';
import { User, Role, UserRoleMapping } from '../../types';
import appContentStyles from '../../components/AppContent.module.css';
import userRoleMappingPageStyles from './UserRoleMappingPage.module.css';
import { authAPI, userAPI } from '../../apis/authApis';

const UserRoleMappingPage: React.FC = () => {
  const navigate = useNavigate();
  const { users, roles, loading: dataLoading, refreshUsers } = useData();
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const [userRoleMappings, setUserRoleMappings] = useState<UserRoleMapping[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserRoles, setSelectedUserRoles] = useState<string[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

const toUserRoleMapping=(users: any[]): UserRoleMapping[]=> {
  return users.map(u => ({
    id: u.id,
    username: u.username,
    roles: u.roles ?? []
  }));
}

  useEffect(() => {
    const fetchUserRoleMappings = async () => {
      try {
        setLoading(true);
        // const userRoleMappingsData = await mockDataAPI.getUserRoleMappings();
        const userRoleMappingsData = toUserRoleMapping(users);
        console.log("userrolemapping in userRoleMapping", users,userRoleMappingsData);
        setUserRoleMappings(userRoleMappingsData);
      } catch (error) {
        console.error('Error fetching user role mappings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoleMappings();
  }, [users]);

  // Auto-load roles when user is selected
  useEffect(() => {
    if (selectedUser) {
      // Use roles from the user object (from API) instead of mock data
      setSelectedUserRoles(selectedUser.roles || []);
    } else {
      setSelectedUserRoles([]);
    }
  }, [selectedUser]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
        setUserSearchTerm('');
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
        setRoleSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setUserSearchTerm(''); // Clear search term to allow searching for other users
    setIsUserDropdownOpen(false);
  };

  const handleRoleAdd = async (roleName: string) => {
    if (!selectedUser || selectedUserRoles.includes(roleName)) return;

    const newRoles = [...selectedUserRoles, roleName];
    
    // Update selectedUserRoles immediately to reflect in UI
    setSelectedUserRoles(newRoles);
    
    // Update local state - this is our source of truth for now
    setUserRoleMappings(prev => {
      const existingIndex = prev.findIndex(mapping => mapping.username === selectedUser.username);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], roles: newRoles };
        return updated;
      } else {
        return [...prev, {
          id: Date.now().toString(),
          username: selectedUser.username,
          roles: newRoles
        }];
      }
    });

    setIsRoleDropdownOpen(false);
    setRoleSearchTerm('');

    // Try to update the mapping in the backend, but don't revert on failure
    try {
      const mappingResponse = await authAPI.userRoleMapping({
        role: roleName,
        userName: selectedUser.username
      });
      
      console.log(`Role ${roleName} assignment response:`, mappingResponse);
      
      // Check if role mapping was successful by checking the message
      let mappingMessage = '';
      let isRoleAssigned = false;

      // Convert response to string for checking (handle all possible formats)
      const mappingResponseStr = typeof mappingResponse === 'string' 
        ? mappingResponse 
        : JSON.stringify(mappingResponse);

      // Check for success indicators in the response
      const responseLower = mappingResponseStr.toLowerCase();
      const hasAssignedSuccess = responseLower.includes('assigned successfully');
      const hasSuccess = responseLower.includes('success');
      const hasError = responseLower.includes('error') || responseLower.includes('failed') || responseLower.includes('fail');

      // Determine success based on multiple indicators
      if (hasAssignedSuccess || (hasSuccess && !hasError)) {
        isRoleAssigned = true;
        // Extract the actual message
        if (typeof mappingResponse === 'string') {
          mappingMessage = mappingResponse;
        } else {
          mappingMessage = mappingResponse.message || 
                           (typeof mappingResponse.data === 'string' ? mappingResponse.data : mappingResponse.data?.message) ||
                           'Role assigned successfully';
        }
      }

      if (isRoleAssigned) {
        console.log(`Successfully added role ${roleName} to user ${selectedUser.username}`);
        // Refresh users data to get updated roles
        await refreshUsers();
        // The UI already shows the new role, no need to update again
        // Users list will be updated via context
      } else {
        console.warn(`Role assignment may have failed: ${mappingMessage}`);
      }
    } catch (error: any) {
      console.error(`Error assigning role ${roleName}:`, error);
      // Show error toast
      const errorMessage = error.response?.data?.message || error.message || `Failed to assign role ${roleName}`;
      toast.error(errorMessage, 3000);
      // Revert the UI change if API call failed
      setSelectedUserRoles(prevRoles => prevRoles.filter(role => role !== roleName));
    }
  };

  const handleRoleRemove = async (roleToRemove: string) => {
    if (!selectedUser) return;

    const newRoles = selectedUserRoles.filter(role => role !== roleToRemove);
    const previousRoles = [...selectedUserRoles]; // Store previous state for rollback

    // Update selectedUserRoles immediately to reflect in UI
    setSelectedUserRoles(newRoles);

    // Update local state - this is our source of truth for now
    setUserRoleMappings(prev => {
      const existingIndex = prev.findIndex(mapping => mapping.username === selectedUser.username);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], roles: newRoles };
        return updated;
      }
      return prev;
    });

    // Call the remove role API
    try {
      console.log(`Removing role ${roleToRemove} from user ${selectedUser.username}...`);
      
      // Call the API to remove the role
      const response = await userAPI.removeUserRole(selectedUser.id, selectedUser, roleToRemove);
      
      console.log('Remove role API response:', response);
      
      // Show success message
      const successMessage = typeof response === 'string' 
        ? response 
        : response.message || `Role ${roleToRemove} removed successfully`;
      
      toast.success(successMessage, 3000);
      
      // Refresh users data to get updated roles from backend
      await refreshUsers();
      
      console.log(`Successfully removed role ${roleToRemove} from user ${selectedUser.username}`);
      
    } catch (error: any) {
      console.error(`Error removing role ${roleToRemove}:`, error);
      
      // Show error toast
      const errorMessage = error.response?.data?.message || error.message || `Failed to remove role ${roleToRemove}`;
      toast.error(errorMessage, 3000);
      
      // Revert the UI change if API call failed
      setSelectedUserRoles(previousRoles);
      
      // Revert local state
      setUserRoleMappings(prev => {
        const existingIndex = prev.findIndex(mapping => mapping.username === selectedUser.username);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], roles: previousRoles };
          return updated;
        }
        return prev;
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Handle closing dropdowns and clearing search terms
  const handleUserDropdownClose = () => {
    setIsUserDropdownOpen(false);
    setUserSearchTerm('');
  };

  const handleRoleDropdownClose = () => {
    setIsRoleDropdownOpen(false);
    setRoleSearchTerm('');
  };

  const availableRoles = roles.filter(role =>
    !selectedUserRoles.includes(role.name) &&
    role.name.toLowerCase().includes(roleSearchTerm.toLowerCase())
  );

 if (dataLoading || loading) {
    return (
      <div className={appContentStyles.userRoleMappingLoading || userRoleMappingPageStyles.userRoleMappingLoading}>
        <div className={appContentStyles.loadingSpinner || userRoleMappingPageStyles.loadingSpinner}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={appContentStyles.userRoleMappingPage || userRoleMappingPageStyles.userRoleMappingPage}>
      <div className={appContentStyles.userRoleMappingHeader || userRoleMappingPageStyles.userRoleMappingHeader}>
        <h1 className={appContentStyles.pageTitle || userRoleMappingPageStyles.pageTitle}>User Role Mapping</h1>
        <div className={appContentStyles.breadcrumb || userRoleMappingPageStyles.breadcrumb}>
          <span className={appContentStyles.breadcrumbItem || userRoleMappingPageStyles.breadcrumbItem}>
            <button className={appContentStyles.breadcrumbLink || userRoleMappingPageStyles.breadcrumbLink} onClick={() => navigate('/admin')}>IAM</button>
          </span>
          <span className={`${appContentStyles.breadcrumbItem || userRoleMappingPageStyles.breadcrumbItem} ${appContentStyles.active || userRoleMappingPageStyles.active}`}>User Role Mapping</span>
        </div>
      </div>

      <div className={appContentStyles.userRoleMappingContent || userRoleMappingPageStyles.userRoleMappingContent}>
        <div className={appContentStyles.mappingContainer || userRoleMappingPageStyles.mappingContainer}>
          {/* User Selection Panel */}
          <div className={`${appContentStyles.mappingPanel || userRoleMappingPageStyles.mappingPanel} ${appContentStyles.userPanel || userRoleMappingPageStyles.userPanel}`}>
            <div className={appContentStyles.panelHeader || userRoleMappingPageStyles.panelHeader}>
              <h2>User</h2>
            </div>
            <div className={appContentStyles.dropdownContainer || userRoleMappingPageStyles.dropdownContainer} ref={userDropdownRef}>
              <div className={appContentStyles.dropdownInput || userRoleMappingPageStyles.dropdownInput} onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
                <span className={appContentStyles.selectedValue || userRoleMappingPageStyles.selectedValue}>
                  {selectedUser ? selectedUser.username : 'Select User'}
                </span>
                <span className={appContentStyles.dropdownArrow || userRoleMappingPageStyles.dropdownArrow}>▼</span>
              </div>
              {isUserDropdownOpen && (
                <div className={appContentStyles.dropdownMenu || userRoleMappingPageStyles.dropdownMenu}>
                  <div className={appContentStyles.searchContainer || userRoleMappingPageStyles.searchContainer}>
                    <input
                      type="text"
                      placeholder="Search"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className={appContentStyles.searchInput || userRoleMappingPageStyles.searchInput}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                  <div className={appContentStyles.dropdownOptions || userRoleMappingPageStyles.dropdownOptions}>
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className={appContentStyles.dropdownOption || userRoleMappingPageStyles.dropdownOption}
                        onClick={() => handleUserSelect(user)}
                      >
                        {user.username}
                      </div>
                    ))}
                    {filteredUsers.length === 0 && userSearchTerm && (
                      <div className={`${appContentStyles.dropdownOption || userRoleMappingPageStyles.dropdownOption} ${appContentStyles.noResults || userRoleMappingPageStyles.noResults}`}>No users found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Roles Selection Panel */}
          <div className={`${appContentStyles.mappingPanel || userRoleMappingPageStyles.mappingPanel} ${appContentStyles.rolesPanel || userRoleMappingPageStyles.rolesPanel}`}>
            <div className={appContentStyles.panelHeader || userRoleMappingPageStyles.panelHeader}>
              <h2>Roles</h2>
            </div>
            <div className={appContentStyles.rolesContent || userRoleMappingPageStyles.rolesContent}>
              {/* Selected Roles Tags */}
              <div className={appContentStyles.selectedRoles || userRoleMappingPageStyles.selectedRoles}>
                {selectedUserRoles.map(roleName => (
                  <div key={roleName} className={appContentStyles.roleTag || userRoleMappingPageStyles.roleTag}>
                    <span className={appContentStyles.roleName || userRoleMappingPageStyles.roleName}>{roleName}</span>
                    <button
                      className={appContentStyles.removeRoleBtn || userRoleMappingPageStyles.removeRoleBtn}
                      onClick={() => handleRoleRemove(roleName)}
                      disabled={!selectedUser}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Role Dropdown */}
              {selectedUser && (
                <div className={appContentStyles.dropdownContainer || userRoleMappingPageStyles.dropdownContainer} ref={roleDropdownRef}>
                  <div className={appContentStyles.dropdownInput || userRoleMappingPageStyles.dropdownInput} onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}>
                    <span className={appContentStyles.selectedValue || userRoleMappingPageStyles.selectedValue}>Add Role</span>
                    <span className={appContentStyles.dropdownArrow || userRoleMappingPageStyles.dropdownArrow}>▼</span>
                  </div>
                  {isRoleDropdownOpen && (
                    <div className={appContentStyles.dropdownMenu || userRoleMappingPageStyles.dropdownMenu}>
                      <div className={appContentStyles.searchContainer || userRoleMappingPageStyles.searchContainer}>
                        <input
                          type="text"
                          placeholder="Search"
                          value={roleSearchTerm}
                          onChange={(e) => setRoleSearchTerm(e.target.value)}
                          className={appContentStyles.searchInput || userRoleMappingPageStyles.searchInput}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <div className={appContentStyles.dropdownOptions || userRoleMappingPageStyles.dropdownOptions}>
                        {availableRoles.map(role => (
                          <div
                            key={role.id}
                            className={appContentStyles.dropdownOption || userRoleMappingPageStyles.dropdownOption}
                            onClick={() => handleRoleAdd(role.name)}
                          >
                            {role.name}
                          </div>
                        ))}
                        {availableRoles.length === 0 && roleSearchTerm && (
                          <div className={`${appContentStyles.dropdownOption || userRoleMappingPageStyles.dropdownOption} ${appContentStyles.noResults || userRoleMappingPageStyles.noResults}`}>No roles found</div>
                        )}
                        {availableRoles.length === 0 && !roleSearchTerm && (
                          <div className={`${appContentStyles.dropdownOption || userRoleMappingPageStyles.dropdownOption} ${appContentStyles.noResults || userRoleMappingPageStyles.noResults}`}>All roles assigned</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRoleMappingPage;
