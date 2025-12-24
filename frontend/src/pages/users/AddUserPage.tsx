import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../apis/authApis';
import appContentStyles from "../../components/AppContent.module.css"
import addUserPageStyles from "./AddUserPage.module.css"

interface AddUserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

const AddUserPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AddUserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare the payload according to backend requirements
      const addUserPayload = {
        resourceName: "Users",
        authMap: {
          userName: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password
        },
        resourceMap: {
          user_name: formData.username,
          user_email: formData.email
        }
      };

      console.log('Adding user with payload:', addUserPayload);
      
      // Call the actual API to add the user
      const response = await authAPI.addUser(addUserPayload);
      console.log('User added successfully:', response);
      
      // Show success message
      alert('User added successfully! You can assign roles from User Role Mapping page.');
      
      // Navigate back to users page after successful creation
      navigate('/admin/users');
    } catch (error: any) {
      console.error('Error adding user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add user. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/users');
  };

  return (
    <div className={appContentStyles.addUserPage || addUserPageStyles.addUserPage}>
      <div className={appContentStyles.addUserHeader || addUserPageStyles.addUserHeader}>
        <div className={appContentStyles.breadcrumb || addUserPageStyles.breadcrumb}>
          <span className={appContentStyles.breadcrumbItem || addUserPageStyles.breadcrumbItem}>
            <button className={appContentStyles.breadcrumbLink || addUserPageStyles.breadcrumbLink} onClick={() => navigate('/admin')}>IAM</button>
          </span>
          <span className={appContentStyles.breadcrumbItem || addUserPageStyles.breadcrumbItem}>
            <button className={appContentStyles.breadcrumbLink || addUserPageStyles.breadcrumbLink} onClick={() => navigate('/admin/users')}>Users</button>
          </span>
          <span className={`${appContentStyles.breadcrumbItem || addUserPageStyles.breadcrumbItem} ${appContentStyles.active || addUserPageStyles.active}`}>Add User</span>
        </div>
        <h1 className={appContentStyles.pageTitle || addUserPageStyles.pageTitle}>Users</h1>
      </div>

      <div className={appContentStyles.addWebContent || addUserPageStyles.addWebContent}>
        <div className={appContentStyles.formContainer || addUserPageStyles.formContainer}>
          <h2 className={appContentStyles.formTitle || addUserPageStyles.formTitle}>Add User</h2>
          
          <form onSubmit={handleSubmit} className={appContentStyles.addUserForm || addUserPageStyles.addUserForm}>
            <div className={appContentStyles.formGroup || addUserPageStyles.formGroup}>
              <label htmlFor="username" className={appContentStyles.formLabel || addUserPageStyles.formLabel}>
                *USERNAME :
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={appContentStyles.formControl || addUserPageStyles.formControl}
                required
              />
            </div>

            <div className={appContentStyles.formGroup || addUserPageStyles.formGroup}>
              <label htmlFor="email" className={appContentStyles.formLabel || addUserPageStyles.formLabel}>
                *EMAIL :
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={appContentStyles.formControl || addUserPageStyles.formControl}
                required
              />
            </div>

            <div className={appContentStyles.formGroup || addUserPageStyles.formGroup}>
              <label htmlFor="firstName" className={appContentStyles.formLabel || addUserPageStyles.formLabel}>
                *FIRST NAME :
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={appContentStyles.formControl || addUserPageStyles.formControl}
                required
              />
            </div>

            <div className={appContentStyles.formGroup || addUserPageStyles.formGroup}>
              <label htmlFor="lastName" className={appContentStyles.formLabel || addUserPageStyles.formLabel}>
                *LAST NAME :
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={appContentStyles.formControl || addUserPageStyles.formControl}
                required
              />
            </div>

            <div className={appContentStyles.formGroup || addUserPageStyles.formGroup}>
              <label htmlFor="password" className={appContentStyles.formLabel || addUserPageStyles.formLabel}>
                *PASSWORD :
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={appContentStyles.formControl || addUserPageStyles.formControl}
                required
              />
            </div>

            <div className={appContentStyles.formActions || addUserPageStyles.formActions}>
              <button
                type="submit"
                className={`${appContentStyles.btn || addUserPageStyles.btn} ${appContentStyles.btnPrimary || addUserPageStyles.btnPrimary}`}
                disabled={loading}
              >
                {loading ? 'Adding User...' : 'Add User'}
              </button>
              <button
                type="button"
                className={`${appContentStyles.btn || addUserPageStyles.btn} ${appContentStyles.btnSecondary || addUserPageStyles.btnSecondary}`}
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserPage;