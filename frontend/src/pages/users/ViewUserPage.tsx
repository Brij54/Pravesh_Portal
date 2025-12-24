import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userAPI } from '../../apis/authApis';
import { User } from '../../types';
import appContentStyles from '../../components/AppContent.module.css';
import viewUserPageStyles from './ViewUserPage.module.css';

const ViewUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        console.log('Fetching user data for:', username);
        
        // Get all users from the API
        const usersData = await userAPI.getUsers();
        console.log('All users data:', usersData);
        
        const foundUser = usersData.find(u => u.username === username);
        console.log('Found user:', foundUser);
        
        if (foundUser) {
          setUser(foundUser);
          setFormData({
            username: foundUser.username,
            email: foundUser.email,
            firstName: foundUser.firstName || '',
            lastName: foundUser.lastName || ''
          });
        } else {
          console.log('User not found in API response');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Prevent username changes as it's the primary key
    if (name === 'username') {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      console.log('Updating user:', user.id, formData);
      
      // Call the actual API to update the user
      // Note: username is not included as it's the primary key and cannot be changed
      const response = await userAPI.updateUser(user.id, {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      console.log('User update response:', response);
      
      // Update local state
      setUser(prev => prev ? { 
        ...prev, 
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
      } : null);
      setIsEditing(false);
      
      // Show success message
      alert('User updated successfully!');
    } catch (error: any) {
      console.error('Error updating user:', error);
      
      // Show more specific error message
      let errorMessage = 'Failed to update user. Please try again.';
      
      if (error.response?.data?.errorMessage) {
        errorMessage = error.response.data.errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className={appContentStyles.viewUserLoading || viewUserPageStyles.viewUserLoading}>
        <div className={appContentStyles.loadingSpinner || viewUserPageStyles.loadingSpinner}>Loading user...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={appContentStyles.viewUserError || viewUserPageStyles.viewUserError}>
        <h2>User not found</h2>
        <button className={`${appContentStyles.btn || viewUserPageStyles.btn} ${appContentStyles.btnPrimary || viewUserPageStyles.btnPrimary}`} onClick={() => navigate('/admin/users')}>
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className={appContentStyles.viewUserPage || viewUserPageStyles.viewUserPage}>
      <div className={appContentStyles.viewUserHeader || viewUserPageStyles.viewUserHeader}>
        <h1 className={appContentStyles.pageTitle || viewUserPageStyles.pageTitle}>Users</h1>
        <div className={appContentStyles.breadcrumb || viewUserPageStyles.breadcrumb}>
          <span className={appContentStyles.breadcrumbItem || viewUserPageStyles.breadcrumbItem}>
            <button className={appContentStyles.breadcrumbLink || viewUserPageStyles.breadcrumbLink} onClick={() => navigate('/admin')}>IAM</button>
          </span>
          <span className={appContentStyles.breadcrumbItem || viewUserPageStyles.breadcrumbItem}>
            <button className={appContentStyles.breadcrumbLink || viewUserPageStyles.breadcrumbLink} onClick={() => navigate('/admin/users')}>Users</button>
          </span>
          <span className={`${appContentStyles.breadcrumbItem || viewUserPageStyles.breadcrumbItem} ${appContentStyles.active || viewUserPageStyles.active}`}>{username}</span>
        </div>
      </div>

      <div className={appContentStyles.viewUserContent || viewUserPageStyles.viewUserContent}>
        <div className={appContentStyles.userDetailsContainer || viewUserPageStyles.userDetailsContainer}>
          <h2 className={appContentStyles.userTitle || viewUserPageStyles.userTitle}>{username}</h2>
          
          <form className={appContentStyles.userDetailsForm || viewUserPageStyles.userDetailsForm}>
            <div className={appContentStyles.formGroup || viewUserPageStyles.formGroup}>
              <label htmlFor="username" className={appContentStyles.formLabel || viewUserPageStyles.formLabel}>
                *USERNAME :
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={appContentStyles.formControl || viewUserPageStyles.formControl}
                disabled={true}
                style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed' }}
                title="Username cannot be changed as it is the primary key"
              />
            </div>

            <div className={appContentStyles.formGroup || viewUserPageStyles.formGroup}>
              <label htmlFor="email" className={appContentStyles.formLabel || viewUserPageStyles.formLabel}>
                *EMAIL :
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={appContentStyles.formControl || viewUserPageStyles.formControl}
                disabled={!isEditing}
              />
            </div>


            <div className={appContentStyles.formGroup || viewUserPageStyles.formGroup}>
              <label htmlFor="firstName" className={appContentStyles.formLabel || viewUserPageStyles.formLabel}>
                *FIRST NAME :
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={appContentStyles.formControl || viewUserPageStyles.formControl}
                disabled={!isEditing}
              />
            </div>

            <div className={appContentStyles.formGroup || viewUserPageStyles.formGroup}>
              <label htmlFor="lastName" className={appContentStyles.formLabel || viewUserPageStyles.formLabel}>
                *LAST NAME :
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={appContentStyles.formControl || viewUserPageStyles.formControl}
                disabled={!isEditing}
              />
            </div>

            <div className={appContentStyles.formGroup || viewUserPageStyles.formGroup}>
              <label className={appContentStyles.formLabel || viewUserPageStyles.formLabel}>
                ROLES :
              </label>
              <div className={appContentStyles.rolesDisplay || viewUserPageStyles.rolesDisplay}>
                {user && user.roles && user.roles.length > 0 ? (
                  <div className={appContentStyles.rolesContainer || viewUserPageStyles.rolesContainer}>
                    {user.roles.map((role, index) => (
                      <span key={index} className={appContentStyles.roleTag || viewUserPageStyles.roleTag}>
                        {role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className={appContentStyles.noRoles || viewUserPageStyles.noRoles}>No roles assigned</span>
                )}
                <div className={appContentStyles.rolesHelpText || viewUserPageStyles.rolesHelpText}>
                  Use User Role Mapping page to manage roles
                </div>
              </div>
            </div>

            <div className={appContentStyles.formActions || viewUserPageStyles.formActions}>
              {!isEditing ? (
                <button
                  type="button"
                  className={`${appContentStyles.btn || viewUserPageStyles.btn} ${appContentStyles.btnPrimary || viewUserPageStyles.btnPrimary}`}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={`${appContentStyles.btn || viewUserPageStyles.btn} ${appContentStyles.btnPrimary || viewUserPageStyles.btnPrimary}`}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className={`${appContentStyles.btn || viewUserPageStyles.btn} ${appContentStyles.btnSecondary || viewUserPageStyles.btnSecondary}`}
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
      </div>
    </div>
  );
};

export default ViewUserPage;