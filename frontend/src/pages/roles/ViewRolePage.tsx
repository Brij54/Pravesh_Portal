import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authAPI, mockDataAPI } from '../../apis/authApis';
import { Role, User, UserRoleMapping } from '../../types';
import appContentStyles from '../../components/AppContent.module.css';
import viewRolePageStyles from './ViewRolePage.module.css';
import { useData } from '../../context/DataContext';

interface RoleDetailsFormData {
  roleName: string;
  description: string;
}

const ViewRolePage: React.FC = () => {
    const { users, roles, loading: dataLoading } = useData();
  const navigate = useNavigate();
  const { roleName } = useParams<{ roleName: string }>();
  const [activeTab, setActiveTab] = useState<'details' | 'user-mapping'>('details');
  const [role, setRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleDetailsFormData>({
    roleName: '',
    description: ''
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedAssignedUsers, setSelectedAssignedUsers] = useState<string[]>([]);
  const [selectedAvailableUsers, setSelectedAvailableUsers] = useState<string[]>([]);
  const [assignedSearchTerm, setAssignedSearchTerm] = useState('');
  const [availableSearchTerm, setAvailableSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const toUserRoleMapping=(users: any[]): UserRoleMapping[]=> {
    return users.map(u => ({
      id: u.id,
      username: u.username,
      roles: u.roles ?? []
    }));
  }
  useEffect(() => {
    const fetchRoleData = async () => {
      if (!roleName) return;
      
      try {
        setLoading(true);

        // Transform string array to Role[] format
        // const rolesData: Role[] = roles.map((roleNameStr:any, index:any) => ({
        //   id: (index + 1).toString(),
        //   name: roleNameStr,
        //   description: '' // API doesn't provide descriptions
        // }));

        const foundRole = roles.find((r: Role) => r.name === roleName);
        if (foundRole) {
          setRole(foundRole);
          setFormData({
            roleName: foundRole.name,
            description: foundRole.description
          });
        }

        setAllUsers(users);

        // Find users assigned to this role
        const usersWithThisRole = toUserRoleMapping(users)
          .filter(mapping => mapping.roles?.includes(roleName))
          .map(mapping => users.find(user => user.username === mapping.username))
          .filter(user => user !== undefined) as User[];

        const usersWithoutThisRole = users.filter(user => 
          !usersWithThisRole.some(assignedUser => assignedUser.id === user.id)
        );

        setAssignedUsers(usersWithThisRole);
        setAvailableUsers(usersWithoutThisRole);
      } catch (error) {
        console.error('Error fetching role data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleData();
  }, [users,roleName,roles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Here you would call the actual API to update the role
      console.log('Updating role:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (role) {
      setFormData({
        roleName: role.name,
        description: role.description
      });
    }
    setIsEditing(false);
  };

  const handleAddUsers = () => {
    const usersToAdd = availableUsers.filter(user => 
      selectedAvailableUsers.includes(user.id)
    );
    
    setAssignedUsers(prev => [...prev, ...usersToAdd]);
    setAvailableUsers(prev => prev.filter(user => 
      !selectedAvailableUsers.includes(user.id)
    ));
    setSelectedAvailableUsers([]);
  };

  const handleRemoveUsers = () => {
    const usersToRemove = assignedUsers.filter(user => 
      selectedAssignedUsers.includes(user.id)
    );
    
    setAvailableUsers(prev => [...prev, ...usersToRemove]);
    setAssignedUsers(prev => prev.filter(user => 
      !selectedAssignedUsers.includes(user.id)
    ));
    setSelectedAssignedUsers([]);
  };

  const filteredAssignedUsers = assignedUsers.filter(user =>
    user.username.toLowerCase().includes(assignedSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(assignedSearchTerm.toLowerCase())
  );

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.username.toLowerCase().includes(availableSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(availableSearchTerm.toLowerCase())
  );

 if (loading) {
    return (
      <div className={appContentStyles.viewRoleLoading || viewRolePageStyles.viewRoleLoading}>
        <div className={appContentStyles.loadingSpinner || viewRolePageStyles.loadingSpinner}>Loading role...</div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className={appContentStyles.viewRoleError || viewRolePageStyles.viewRoleError}>
        <h2>Role not found</h2>
        <button className={`${appContentStyles.btn || viewRolePageStyles.btn} ${appContentStyles.btnPrimary || viewRolePageStyles.btnPrimary}`} onClick={() => navigate('/roles')}>
          Back to Roles
        </button>
      </div>
    );
  }

  return (
    <div className={appContentStyles.viewRolePage || viewRolePageStyles.viewRolePage}>
      <div className={appContentStyles.viewRoleHeader || viewRolePageStyles.viewRoleHeader}>
        <h1 className={appContentStyles.pageTitle || viewRolePageStyles.pageTitle}>Roles</h1>
        <div className={appContentStyles.breadcrumb || viewRolePageStyles.breadcrumb}>
          <span className={appContentStyles.breadcrumbItem || viewRolePageStyles.breadcrumbItem}>
            <button className={appContentStyles.breadcrumbLink || viewRolePageStyles.breadcrumbLink} onClick={() => navigate('/admin')}>IAM</button>
          </span>
          <span className={appContentStyles.breadcrumbItem || viewRolePageStyles.breadcrumbItem}>
            <button className={appContentStyles.breadcrumbLink || viewRolePageStyles.breadcrumbLink} onClick={() => navigate('/admin/roles')}>Roles</button>
          </span>
          <span className={`${appContentStyles.breadcrumbItem || viewRolePageStyles.breadcrumbItem} ${appContentStyles.active || viewRolePageStyles.active}`}>{roleName}</span>
        </div>
      </div>

      <div className={appContentStyles.viewRoleContent || viewRolePageStyles.viewRoleContent}>
        <div className={appContentStyles.roleDetailsContainer || viewRolePageStyles.roleDetailsContainer}>
          <div className={appContentStyles.tabsHeader || viewRolePageStyles.tabsHeader}>
            <button
              className={`${appContentStyles.tabButton || viewRolePageStyles.tabButton} ${activeTab === 'details' ? (appContentStyles.active || viewRolePageStyles.active) : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={`${appContentStyles.tabButton || viewRolePageStyles.tabButton} ${activeTab === 'user-mapping' ? (appContentStyles.active || viewRolePageStyles.active) : ''}`}
              onClick={() => setActiveTab('user-mapping')}
            >
              Role User Mapping
            </button>
          </div>

          <h2 className={appContentStyles.roleTitle || viewRolePageStyles.roleTitle}>{roleName}</h2>

          {activeTab === 'details' && (
            <div className={appContentStyles.detailsTab || viewRolePageStyles.detailsTab}>
              <form className={appContentStyles.roleDetailsForm || viewRolePageStyles.roleDetailsForm}>
                <div className={appContentStyles.formGroup || viewRolePageStyles.formGroup}>
                  <label htmlFor="roleName" className={appContentStyles.formLabel || viewRolePageStyles.formLabel}>
                    *Role Name :
                  </label>
                  <input
                    type="text"
                    id="roleName"
                    name="roleName"
                    value={formData.roleName}
                    onChange={handleInputChange}
                    className={appContentStyles.formControl || viewRolePageStyles.formControl}
                    disabled={!isEditing}
                  />
                </div>

                <div className={appContentStyles.formGroup || viewRolePageStyles.formGroup}>
                  <label htmlFor="description" className={appContentStyles.formLabel || viewRolePageStyles.formLabel}>
                    Description :
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={appContentStyles.formControl || viewRolePageStyles.formControl}
                    disabled={!isEditing}
                  />
                </div>

                <div className={appContentStyles.formActions || viewRolePageStyles.formActions}>
                  {!isEditing ? (
                    <button
                      type="button"
                      className={`${appContentStyles.btn || viewRolePageStyles.btn} ${appContentStyles.btnPrimary || viewRolePageStyles.btnPrimary}`}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={`${appContentStyles.btn || viewRolePageStyles.btn} ${appContentStyles.btnPrimary || viewRolePageStyles.btnPrimary}`}
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        className={`${appContentStyles.btn || viewRolePageStyles.btn} ${appContentStyles.btnSecondary || viewRolePageStyles.btnSecondary}`}
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          )}

          {activeTab === 'user-mapping' && (
            <div className={appContentStyles.userMappingTab || viewRolePageStyles.userMappingTab}>
              <div className={appContentStyles.userMappingContainer || viewRolePageStyles.userMappingContainer}>
                <div className={appContentStyles.userPanel || viewRolePageStyles.userPanel}>
                  <div className={appContentStyles.panelHeader || viewRolePageStyles.panelHeader}>
                    <input
                      type="text"
                      placeholder="Search"
                      value={assignedSearchTerm}
                      onChange={(e) => setAssignedSearchTerm(e.target.value)}
                      className={appContentStyles.searchInput || viewRolePageStyles.searchInput}
                    />
                  </div>
                  <div className={appContentStyles.userList || viewRolePageStyles.userList}>
                    {filteredAssignedUsers.map(user => (
                      <label key={user.id} className={appContentStyles.userItem || viewRolePageStyles.userItem}>
                        <input
                          type="checkbox"
                          checked={selectedAssignedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAssignedUsers(prev => [...prev, user.id]);
                            } else {
                              setSelectedAssignedUsers(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                        />
                        <span className={appContentStyles.userName || viewRolePageStyles.userName}>{user.username}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={appContentStyles.mappingActions || viewRolePageStyles.mappingActions}>
                  <button
                    className={`${appContentStyles.btn || viewRolePageStyles.btn} ${appContentStyles.btnPrimary || viewRolePageStyles.btnPrimary} ${appContentStyles.actionBtn || viewRolePageStyles.actionBtn}`}
                    onClick={handleRemoveUsers}
                    disabled={selectedAssignedUsers.length === 0}
                  >
                    Add Users →
                  </button>
                  <button
                    className={`${appContentStyles.btn || viewRolePageStyles.btn} ${appContentStyles.btnPrimary || viewRolePageStyles.btnPrimary} ${appContentStyles.actionBtn || viewRolePageStyles.actionBtn}`}
                    onClick={handleAddUsers}
                    disabled={selectedAvailableUsers.length === 0}
                  >
                    ← Remove Users
                  </button>
                </div>

                <div className={appContentStyles.userPanel || viewRolePageStyles.userPanel}>
                  <div className={appContentStyles.panelHeader || viewRolePageStyles.panelHeader}>
                    <input
                      type="text"
                      placeholder="Search"
                      value={availableSearchTerm}
                      onChange={(e) => setAvailableSearchTerm(e.target.value)}
                      className={appContentStyles.searchInput || viewRolePageStyles.searchInput}
                    />
                  </div>
                  <div className={appContentStyles.userList || viewRolePageStyles.userList}>
                    {filteredAvailableUsers.map(user => (
                      <label key={user.id} className={appContentStyles.userItem || viewRolePageStyles.userItem}>
                        <input
                          type="checkbox"
                          checked={selectedAvailableUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAvailableUsers(prev => [...prev, user.id]);
                            } else {
                              setSelectedAvailableUsers(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                        />
                        <span className={appContentStyles.userName || viewRolePageStyles.userName}>{user.username}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewRolePage;