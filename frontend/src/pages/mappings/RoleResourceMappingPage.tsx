import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';

import { authAPI } from '../../apis/authApis';
import appContentStyles from "../../components/AppContent.module.css"
import roleResourceMappingPageStyles from "./RoleResourceMappingPage.module.css"
/**
 * Static action list used in the system:
 * - GET_BY_ID, GET_ALL -> Read permission
 * - add -> Create permission
 * - MODIFY -> Update permission
 * - DELETE -> Delete permission
 */

interface RoleWithDescription {
  id: string;
  name: string;
  description: string;
}

const RoleResourceMappingPage: React.FC = () => {
  const navigate = useNavigate();
  const { roles: contextRoles, loading: dataLoading, refreshRoles } = useData();
  const [filteredRoles, setFilteredRoles] = useState<RoleWithDescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [addingRole, setAddingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transform context roles to RoleWithDescription format - use useMemo to prevent infinite loop
  const roles: RoleWithDescription[] = React.useMemo(() => {
    return contextRoles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description || ''
    }));
  }, [contextRoles]);

  useEffect(() => {
    if (roles && roles.length > 0) {
      const filtered = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRoles(filtered);
    } else {
      setFilteredRoles([]);
    }
  }, [searchTerm, roles]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRoles(filteredRoles.map(role => role.id));
    } else {
      setSelectedRoles([]);
    }
  };

  const handleSelectRole = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId]);
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId));
    }
  };

  const handleRoleClick = (roleName: string) => {
    // React Router handles URL encoding automatically, but we'll encode for safety with special characters
    const encodedRoleName = encodeURIComponent(roleName);
    navigate(`/admin/role-resource-mapping/view/${encodedRoleName}`);
  };

  const handleAddRole = () => {
    setShowAddRoleModal(true);
    setNewRoleName('');
    setError(null);
  };

  const handleCloseModal = () => {
    setShowAddRoleModal(false);
    setNewRoleName('');
    setError(null);
  };

  const handleSubmitAddRole = async () => {
    if (!newRoleName.trim()) {
      setError('Role name is required');
      return;
    }

    try {
      setAddingRole(true);
      setError(null);
      
      // Call the API to add client role
      console.log('Calling add-client-role API with roleName:', newRoleName.trim());
      const addRoleResponse = await authAPI.addClientRole(newRoleName.trim());
      console.log('Add role response:', addRoleResponse);
      console.log('Response type:', typeof addRoleResponse);

      // Check if role creation was successful by checking the message
      // Expected response: "Client role 'TEST1' added successfully to client 'maitri-test-client'"
      let responseMessage = '';
      let isRoleCreated = false;

      // Convert response to string for checking (handle all possible formats)
      const responseStr = typeof addRoleResponse === 'string' 
        ? addRoleResponse 
        : JSON.stringify(addRoleResponse);

      console.log('Response as string:', responseStr);

      // Check for success indicators in the response
      const responseLower = responseStr.toLowerCase();
      const hasAddedSuccess = responseLower.includes('added successfully');
      const hasSuccess = responseLower.includes('success');
      const hasError = responseLower.includes('error') || responseLower.includes('failed') || responseLower.includes('fail');

      // Determine success based on multiple indicators
      if (hasAddedSuccess || (hasSuccess && !hasError)) {
        isRoleCreated = true;
        // Extract the actual message
        if (typeof addRoleResponse === 'string') {
          responseMessage = addRoleResponse;
        } else {
          responseMessage = addRoleResponse.message || 
                           (typeof addRoleResponse.data === 'string' ? addRoleResponse.data : addRoleResponse.data?.message) ||
                           'Role created successfully';
        }
      } else if (typeof addRoleResponse === 'string') {
        // Response is a plain string but doesn't contain success - might be an error
        responseMessage = addRoleResponse;
        isRoleCreated = false;
      } else if (addRoleResponse && typeof addRoleResponse === 'object') {
        // Response is an object - try to extract message
        responseMessage = addRoleResponse.message || 
                         (typeof addRoleResponse.data === 'string' ? addRoleResponse.data : addRoleResponse.data?.message) ||
                         '';
        
        // Check if message contains success indicators
        const msgLower = responseMessage.toLowerCase();
        isRoleCreated = msgLower.includes('added successfully') || 
                       (msgLower.includes('success') && !msgLower.includes('error') && !msgLower.includes('failed'));
        
        // Also check success field if it exists
        if (!isRoleCreated && addRoleResponse.success === true) {
          isRoleCreated = true;
        }
        
        // If we still don't have a message, use the stringified response
        if (!responseMessage) {
          responseMessage = responseStr;
        }
      }

      console.log('Extracted message:', responseMessage);
      console.log('Is role created:', isRoleCreated);

      if (!isRoleCreated) {
        // Extract error message
        let errorMessage = responseMessage || 'Failed to create role. Please try again.';
        
        // Try to parse nested JSON errors
        if (errorMessage && typeof errorMessage === 'string') {
          try {
            const jsonMatch = errorMessage.match(/\{.*?\}/);
            if (jsonMatch) {
              const errorObj = JSON.parse(jsonMatch[0]);
              const field = errorObj.field || '';
              const errorType = errorObj.errorMessage || '';
              const params = errorObj.params || [];
              
              if (errorType === 'error-duplicate') {
                errorMessage = `Role "${newRoleName.trim()}" already exists. Please choose a different name.`;
              } else if (errorType && field) {
                errorMessage = `${field.charAt(0).toUpperCase() + field.slice(1)}: ${errorType}`;
              }
            }
          } catch (parseError) {
            // Use original error message if parsing fails
          }
        }
        
        setError(errorMessage);
        setAddingRole(false);
        return;
      }

      // If we reach here, role was created successfully
      // Refresh roles data in context
      await refreshRoles();
      handleCloseModal();
      alert('Role added successfully!');
      
    } catch (err: any) {
      console.error('Error adding role:', err);
      
      // Extract error message
      let errorMessage = 'Failed to create role. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errorMessage) {
        errorMessage = err.response.data.errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setAddingRole(false);
    }
  };

 if (dataLoading) {
    return (
      <div className={appContentStyles.roleResourceMappingPage||roleResourceMappingPageStyles.roleResourceMappingPage}>
        <div className={roleResourceMappingPageStyles.loadingSpinner}>Loading roles...</div>
      </div>
    );
  }

  return (
    <div className={appContentStyles.roleResourceMappingLoading || roleResourceMappingPageStyles.roleResourceMappingLoading}>
      <div className={appContentStyles.roleResourceMappingHeader || roleResourceMappingPageStyles.roleResourceMappingHeader}>
        <h1 className={appContentStyles.pageTitle || roleResourceMappingPageStyles.pageTitle}>Role Resource Mapping</h1>
        <div className={appContentStyles.breadcrumb || roleResourceMappingPageStyles.breadcrumb}>
          <span className={appContentStyles.breadcrumbItem || roleResourceMappingPageStyles.breadcrumbItem}>
            <button className={appContentStyles.breadcrumbLink || roleResourceMappingPageStyles.breadcrumbLink} onClick={() => navigate('/admin')}>IAM</button>
          </span>
          <span className={`${appContentStyles.breadcrumbItem || roleResourceMappingPageStyles.breadcrumbItem} ${appContentStyles.active || roleResourceMappingPageStyles.active}`}>Role Resource Mapping</span>
        </div>
      </div>

      <div className={appContentStyles.roleResourceMappingContent || roleResourceMappingPageStyles.roleResourceMappingContent}>
        <div className={appContentStyles.rolesControls || roleResourceMappingPageStyles.rolesControls}>
          <div className={appContentStyles.searchContainer || roleResourceMappingPageStyles.searchContainer}>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={appContentStyles.searchInput || roleResourceMappingPageStyles.searchInput}
            />
          </div>
          <div className={appContentStyles.actionButtons || roleResourceMappingPageStyles.actionButtons}>
            <button className={`${appContentStyles.btn || roleResourceMappingPageStyles.btn} ${appContentStyles.btnPrimary || roleResourceMappingPageStyles.btnPrimary}`} onClick={handleAddRole}>
              Add Role
            </button>
          </div>
        </div>

        <div className={appContentStyles.rolesTableContainer || roleResourceMappingPageStyles.rolesTableContainer}>
          <table className={appContentStyles.rolesTable || roleResourceMappingPageStyles.rolesTable}>
            <thead>
              <tr>
                <th className={appContentStyles.checkboxColumn || roleResourceMappingPageStyles.checkboxColumn}>
                  <input
                    type="checkbox"
                    checked={selectedRoles.length === filteredRoles.length && filteredRoles.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className={appContentStyles.sortableHeader || roleResourceMappingPageStyles.sortableHeader}>
                  <div className={appContentStyles.headerContent || roleResourceMappingPageStyles.headerContent}>
                    <span>Role name</span>
                    <div className={appContentStyles.sortIcons || roleResourceMappingPageStyles.sortIcons}>
                      <span className={appContentStyles.sortIcon || roleResourceMappingPageStyles.sortIcon}>▲</span>
                      <span className={appContentStyles.sortIcon || roleResourceMappingPageStyles.sortIcon}>▼</span>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((role, index) => (
                <tr key={role.id} className={index % 2 === 0 ? (appContentStyles.rowEven || roleResourceMappingPageStyles.rowEven) : (appContentStyles.rowOdd || roleResourceMappingPageStyles.rowOdd)}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={(e) => handleSelectRole(role.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <button
                      className={appContentStyles.roleLink || roleResourceMappingPageStyles.roleLink}
                      onClick={() => handleRoleClick(role.name)}
                    >
                      {role.name}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className={appContentStyles.modalOverlay || roleResourceMappingPageStyles.modalOverlay} onClick={handleCloseModal}>
          <div className={appContentStyles.modalContent || roleResourceMappingPageStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={appContentStyles.modalHeader || roleResourceMappingPageStyles.modalHeader}>
              <h2>Add New Role</h2>
              <button className={appContentStyles.modalClose || roleResourceMappingPageStyles.modalClose} onClick={handleCloseModal}>×</button>
            </div>
            <div className={appContentStyles.modalBody || roleResourceMappingPageStyles.modalBody}>
              <div className={appContentStyles.formGroup || roleResourceMappingPageStyles.formGroup}>
                <label htmlFor="roleName">Role Name:</label>
                <input
                  id="roleName"
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Enter role name"
                  className={appContentStyles.formInput || roleResourceMappingPageStyles.formInput}
                  disabled={addingRole}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !addingRole) {
                      handleSubmitAddRole();
                    }
                  }}
                />
              </div>
              {error && (
                <div className={appContentStyles.errorMessage || roleResourceMappingPageStyles.errorMessage} style={{ color: '#d32f2f', marginTop: '8px', fontSize: '14px' }}>
                  {error}
                </div>
              )}
            </div>
            <div className={appContentStyles.modalFooter || roleResourceMappingPageStyles.modalFooter}>
                            <button
                              className={`${appContentStyles.btn || roleResourceMappingPageStyles.btn} ${appContentStyles.btnSecondary || roleResourceMappingPageStyles.btnSecondary}`}                onClick={handleCloseModal}
                disabled={addingRole}
              >
                Cancel
              </button>
                            <button
                              className={`${appContentStyles.btn || roleResourceMappingPageStyles.btn} ${appContentStyles.btnPrimary || roleResourceMappingPageStyles.btnPrimary}`}                onClick={handleSubmitAddRole}
                disabled={addingRole || !newRoleName.trim()}
              >
                {addingRole ? 'Adding...' : 'Add Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleResourceMappingPage;
