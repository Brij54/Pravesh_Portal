import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Role } from '../../types';
import appContentStyles from '../../components/AppContent.module.css';
import rolesPageStyles from './RolesPage.module.css';

const RolesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roles, refreshRoles, loading } = useData();
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Refresh roles when navigating back from add role page
  useEffect(() => {
    refreshRoles();
  }, [location.pathname]);

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
    navigate(`/admin/roles/view/${roleName}`);
  };

  const handleAddRole = () => {
    navigate('/admin/roles/add');
  };

  const handleBulkUpload = () => {
    navigate('/admin/roles/bulk-upload');
  };

   if (loading) {
    return (
      <div className={appContentStyles.rolesPageLoading || rolesPageStyles.rolesPageLoading}>
        <div className={appContentStyles.loadingSpinner || rolesPageStyles.loadingSpinner}>Loading roles...</div>
      </div>
    );
  }

  return (
    <div className={appContentStyles.rolesPage || rolesPageStyles.rolesPage}>
      <div className={appContentStyles.rolesHeader || rolesPageStyles.rolesHeader}>
        <h1 className={appContentStyles.pageTitle || rolesPageStyles.pageTitle}>Roles</h1>
        <div className={appContentStyles.breadcrumb || rolesPageStyles.breadcrumb}>
          <span className={appContentStyles.breadcrumbItem || rolesPageStyles.breadcrumbItem}>
            <button className={appContentStyles.breadcrumbLink || rolesPageStyles.breadcrumbLink} onClick={() => navigate('/admin')}>IAM</button>
          </span>
          <span className={`${appContentStyles.breadcrumbItem || rolesPageStyles.breadcrumbItem} ${appContentStyles.active || rolesPageStyles.active}`}>Roles</span>
        </div>
      </div>

      <div className={appContentStyles.rolesContent || rolesPageStyles.rolesContent}>
        <div className={appContentStyles.rolesControls || rolesPageStyles.rolesControls}>
          <div className={appContentStyles.searchContainer || rolesPageStyles.searchContainer}>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={appContentStyles.searchInput || rolesPageStyles.searchInput}
            />
          </div>
          <div className={appContentStyles.actionButtons || rolesPageStyles.actionButtons}>
            <button className={`${appContentStyles.btn || rolesPageStyles.btn} ${appContentStyles.btnPrimary || rolesPageStyles.btnPrimary}`} onClick={handleAddRole}>
              Add Role
            </button>
            <button className={`${appContentStyles.btn || rolesPageStyles.btn} ${appContentStyles.btnPrimary || rolesPageStyles.btnPrimary}`} onClick={handleBulkUpload}>
              Bulk Upload
            </button>
          </div>
        </div>

        <div className={appContentStyles.rolesTableContainer || rolesPageStyles.rolesTableContainer}>
          <table className={appContentStyles.rolesTable || rolesPageStyles.rolesTable}>
            <thead>
              <tr>
                <th className={appContentStyles.checkboxColumn || rolesPageStyles.checkboxColumn}>
                  <input
                    type="checkbox"
                    checked={selectedRoles.length === filteredRoles.length && filteredRoles.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className={appContentStyles.sortableHeader || rolesPageStyles.sortableHeader}>
                  <div className={appContentStyles.headerContent || rolesPageStyles.headerContent}>
                    <span>Role name</span>
                    <div className={appContentStyles.sortIcons || rolesPageStyles.sortIcons}>
                      <span className={appContentStyles.sortIcon || rolesPageStyles.sortIcon}>▲</span>
                      <span className={appContentStyles.sortIcon || rolesPageStyles.sortIcon}>▼</span>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((role, index) => (
                <tr key={role.id} className={index % 2 === 0 ? (appContentStyles.rowEven || rolesPageStyles.rowEven) : (appContentStyles.rowOdd || rolesPageStyles.rowOdd)}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={(e) => handleSelectRole(role.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <button
                      className={appContentStyles.roleLink || rolesPageStyles.roleLink}
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
    </div>
  );
};

export default RolesPage;