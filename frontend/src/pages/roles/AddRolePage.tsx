import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../apis/authApis';
import { useData } from '../../context/DataContext';
import { toast } from '../../utils/toast';
import appContentStyles from '../../components/AppContent.module.css';
import addRolePageStyles from './AddRolePage.module.css';

interface AddRoleFormData {
  roleName: string;
}

const AddRolePage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshRoles } = useData();
  const [formData, setFormData] = useState<AddRoleFormData>({
    roleName: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      // Validate roleName is provided
      if (!formData.roleName || formData.roleName.trim() === '') {
        toast.error('Role name is required', 3000);
        setLoading(false);
        return;
      }

      // Call the API to add client role
      console.log('Calling add-client-role API with roleName:', formData.roleName);
      const addRoleResponse = await authAPI.addClientRole(formData.roleName);
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
        
        // Try to parse nested JSON errors (similar to add user)
        if (errorMessage && typeof errorMessage === 'string') {
          try {
            const jsonMatch = errorMessage.match(/\{.*?\}/);
            if (jsonMatch) {
              const errorObj = JSON.parse(jsonMatch[0]);
              const field = errorObj.field || '';
              const errorType = errorObj.errorMessage || '';
              const params = errorObj.params || [];
              
              if (errorType === 'error-duplicate') {
                errorMessage = `Role "${formData.roleName}" already exists. Please choose a different name.`;
              } else if (errorType && field) {
                errorMessage = `${field.charAt(0).toUpperCase() + field.slice(1)}: ${errorType}`;
              }
            }
          } catch (parseError) {
            // Use original error message if parsing fails
          }
        }
        
        toast.error(errorMessage, 5000);
        // Stay on form for error (as per requirement)
        setLoading(false);
        return;
      }

      // If we reach here, role was created successfully
      toast.success('Role created successfully!', 3000);
      
      // Refresh roles data in context
      await refreshRoles();
      
      // Navigate back to roles page after successful creation
      navigate('/admin/roles');
      
    } catch (error: any) {
      console.error('Error adding role:', error);
      
      // Extract error message
      let errorMessage = 'Failed to create role. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errorMessage) {
        errorMessage = error.response.data.errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show error toast
      toast.error(errorMessage, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/roles');
  };

 return (
    <div className={appContentStyles.addRolePage || addRolePageStyles.addRolePage}>
      <div className={appContentStyles.addRoleHeader || addRolePageStyles.addRoleHeader}>
        <h1 className={appContentStyles.pageTitle || addRolePageStyles.pageTitle}>Roles</h1>
        <div className={appContentStyles.breadcrumb || addRolePageStyles.breadcrumb}>
          <span className={appContentStyles.breadcrumbItem || addRolePageStyles.breadcrumbItem}>
            <button className={appContentStyles.breadcrumbLink || addRolePageStyles.breadcrumbLink} onClick={() => navigate('/admin')}>IAM</button>
          </span>
          <span className={appContentStyles.breadcrumbItem || addRolePageStyles.breadcrumbItem}>
            <button className={appContentStyles.breadcrumbLink || addRolePageStyles.breadcrumbLink} onClick={() => navigate('/admin/roles')}>Roles</button>
          </span>
          <span className={`${appContentStyles.breadcrumbItem || addRolePageStyles.breadcrumbItem} ${appContentStyles.active || addRolePageStyles.active}`}>Add Role</span>
        </div>
      </div>

      <div className={appContentStyles.addRoleContent || addRolePageStyles.addRoleContent}>
        <div className={appContentStyles.formContainer || addRolePageStyles.formContainer}>
          <h2 className={appContentStyles.formTitle || addRolePageStyles.formTitle}>Add Role</h2>
          
          <form onSubmit={handleSubmit} className={appContentStyles.addRoleForm || addRolePageStyles.addRoleForm}>
            <div className={appContentStyles.formGroup || addRolePageStyles.formGroup}>
              <label htmlFor="roleName" className={appContentStyles.formLabel || addRolePageStyles.formLabel}>
                *Role Name :
              </label>
              <input
                type="text"
                id="roleName"
                name="roleName"
                value={formData.roleName}
                onChange={handleInputChange}
                className={appContentStyles.formControl || addRolePageStyles.formControl}
                required
              />
            </div>

            <div className={appContentStyles.formActions || addRolePageStyles.formActions}>
              <button
                type="submit"
                className={`${appContentStyles.btn || addRolePageStyles.btn} ${appContentStyles.btnPrimary || addRolePageStyles.btnPrimary}`}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className={`${appContentStyles.btn || addRolePageStyles.btn} ${appContentStyles.btnSecondary || addRolePageStyles.btnSecondary}`}
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

export default AddRolePage;