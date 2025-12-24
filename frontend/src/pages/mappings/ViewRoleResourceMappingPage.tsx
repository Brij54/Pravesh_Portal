import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import appContentStyles from '../../components/AppContent.module.css';
import viewRoleResourceMappingPageStyles from './ViewRoleResourceMappingPage.module.css';
import { roleResourceAPI } from '../../apis/authApis';

interface ResourcePermission {
  name: string;
  permissions: {
    getById: boolean;
    getAll: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

interface RolePermissions {
  role: string;
  resources: ResourcePermission[];
}

const ViewRoleResourceMappingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roleName: rawRoleName } = useParams<{ roleName: string }>();
  // React Router automatically decodes URL params, but we decode manually for safety
  const roleName = rawRoleName ? decodeURIComponent(rawRoleName) : '';
  const [rolePermissions, setRolePermissions] = useState<RolePermissions | null>(null);
  const [originalPermissions, setOriginalPermissions] = useState<RolePermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchRolePermissions = async () => {
      if (!roleName) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch role resource permissions from API
        const response = await roleResourceAPI.getRoleResourcePermissions(roleName);
        
        // Check if response has the expected structure
        if (!response || !response.resource || !Array.isArray(response.resource)) {
          setRolePermissions({
            role: roleName,
            resources: []
          });
          return;
        }
        
        console.log('API Response:', response);
        console.log('Response resources:', response.resource);
        
        // Create a map of resource -> permissions from API response
        const permissionsMap: { [key: string]: { getById: boolean; getAll: boolean; create: boolean; update: boolean; delete: boolean } } = {};
        
        // Extract unique resource names from the permissions response
        const resourcesFromPermissions: Set<string> = new Set();
        
        response.resource.forEach((item: any) => {
          const resourceName = item.resource;
          if (resourceName) {
            resourcesFromPermissions.add(resourceName);
          }
          
          const actions = item.action || [];
          
          // Map actions to permissions based on static action list:
          // GET_BY_ID -> getById (separate)
          // GET_ALL -> getAll (separate)
          // add -> create
          // MODIFY -> update
          // DELETE -> delete
          const permissions = {
            getById: actions.some((action: string) => 
              ['GET_BY_ID'].includes(action.toUpperCase())
            ),
            getAll: actions.some((action: string) => 
              ['GET_ALL'].includes(action.toUpperCase())
            ),
            create: actions.some((action: string) => 
              ['ADD'].includes(action.toUpperCase())
            ),
            update: actions.some((action: string) => 
              ['MODIFY'].includes(action.toUpperCase())
            ),
            delete: actions.some((action: string) => 
              ['DELETE'].includes(action.toUpperCase())
            )
          };
          
          if (resourceName) {
            // Merge with existing permissions if resource already exists
            if (permissionsMap[resourceName]) {
              permissionsMap[resourceName] = {
                getById: permissionsMap[resourceName].getById || permissions.getById,
                getAll: permissionsMap[resourceName].getAll || permissions.getAll,
                create: permissionsMap[resourceName].create || permissions.create,
                update: permissionsMap[resourceName].update || permissions.update,
                delete: permissionsMap[resourceName].delete || permissions.delete
              };
            } else {
              permissionsMap[resourceName] = permissions;
            }
          }
        });
        
        // Get all available resources first (to ensure we show all resources, even without permissions)
        let allResources: string[] = [];
        try {
          allResources = await roleResourceAPI.getAllResources();
          console.log('All resources from API:', allResources);
        } catch (error) {
          console.error('Error fetching all resources:', error);
        }
        
        // Combine resources: prefer getAllResources, fallback to resources from permissions response
        const uniqueAllResources = new Set<string>();
        
        // Add all resources from getAllResources API
        if (allResources && allResources.length > 0) {
          allResources.forEach(resource => uniqueAllResources.add(resource));
        }
        
        // Add resources from permissions response (in case getAllResources is empty or failed)
        resourcesFromPermissions.forEach(resource => uniqueAllResources.add(resource));
        
        console.log('Combined unique resources:', Array.from(uniqueAllResources));
        
        // Combine all resources with their permissions (or default false if not in response)
        const resourcesWithPermissions: ResourcePermission[] = Array.from(uniqueAllResources).map(resourceName => ({
          name: resourceName,
          permissions: permissionsMap[resourceName] || {
            getById: false,
            getAll: false,
            create: false,
            update: false,
            delete: false
          }
        }));
        
        // Create RolePermissions object
        const permissionsData: RolePermissions = {
          role: roleName,
          resources: resourcesWithPermissions
        };
        
        console.log('Final permissions data:', permissionsData);
        console.log('Number of resources:', resourcesWithPermissions.length);
        
        setRolePermissions(permissionsData);
        // Store original permissions for comparison when saving
        setOriginalPermissions(JSON.parse(JSON.stringify(permissionsData)));
      } catch (error) {
        console.error('Error fetching role resource permissions:', error);
        // Set empty state on error
        setRolePermissions({
          role: roleName || '',
          resources: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRolePermissions();
  }, [roleName]); // Only depend on roleName, not the entire component

  const handlePermissionChange = (resourceName: string, permission: 'getById' | 'getAll' | 'create' | 'update' | 'delete', checked: boolean) => {
    if (!rolePermissions) return;

    setRolePermissions(prev => {
      if (!prev) return prev;
      
      const updatedResources = prev.resources.map(resource => {
        if (resource.name === resourceName) {
          return {
            ...resource,
            permissions: {
              ...resource.permissions,
              [permission]: checked        
            }
          };
        }
        return resource;
      });

      return {
        ...prev,
        resources: updatedResources
      };
    });

    setHasChanges(true);
  };

  // Handle row-wise selection (resource checkbox)
  const handleResourceCheckboxChange = (resourceName: string, checked: boolean) => {
    if (!rolePermissions) return;

    setRolePermissions(prev => {
      if (!prev) return prev;
      
      const updatedResources = prev.resources.map(resource => {
        if (resource.name === resourceName) {
          return {
            ...resource,
            permissions: {
              getById: checked,
              getAll: checked,
              create: checked,
              update: checked,
              delete: checked
            }
          };
        }
        return resource;
      });

      return {
        ...prev,
        resources: updatedResources
      };
    });

    setHasChanges(true);
  };

  // Handle column-wise selection (operation checkbox)
  const handleOperationCheckboxChange = (operation: 'getById' | 'getAll' | 'create' | 'update' | 'delete', checked: boolean) => {
    if (!rolePermissions) return;

    setRolePermissions(prev => {
      if (!prev) return prev;
      
      const updatedResources = prev.resources.map(resource => ({
        ...resource,
        permissions: {
          ...resource.permissions,
          [operation]: checked
        }
      }));

      return {
        ...prev,
        resources: updatedResources
      };
    });

    setHasChanges(true);
  };

  // Handle select-all (top-left checkbox)
  const handleSelectAllChange = (checked: boolean) => {
    if (!rolePermissions) return;

    setRolePermissions(prev => {
      if (!prev) return prev;
      
      const updatedResources = prev.resources.map(resource => ({
        ...resource,
        permissions: {
          getById: checked,
          getAll: checked,
          create: checked,
          update: checked,
          delete: checked
        }
      }));

      return {
        ...prev,
        resources: updatedResources
      };
    });

    setHasChanges(true);
  };

  // Helper functions to determine checkbox states
  const isResourceFullySelected = (resourceName: string): boolean => {
    if (!rolePermissions) return false;
    const resource = rolePermissions.resources.find(r => r.name === resourceName);
    if (!resource) return false;
    return resource.permissions.getById && resource.permissions.getAll && 
           resource.permissions.create && resource.permissions.update && resource.permissions.delete;
  };

  const isOperationFullySelected = (operation: 'getById' | 'getAll' | 'create' | 'update' | 'delete'): boolean => {
    if (!rolePermissions) return false;
    return rolePermissions.resources.every(resource => resource.permissions[operation]);
  };

  const isAllSelected = (): boolean => {
    if (!rolePermissions) return false;
    return rolePermissions.resources.every(resource => 
      resource.permissions.getById && resource.permissions.getAll && 
      resource.permissions.create && resource.permissions.update && resource.permissions.delete
    );
  };

  const handleSave = async () => {
  if (!rolePermissions || !originalPermissions) return;

  try {
    const savePromises: Promise<any>[] = [];

    // Strong TS type for permission keys
    type PermissionKey = "getById" | "getAll" | "create" | "update" | "delete";

    const permissionToActionMap: Record<PermissionKey, string> = {
      getById: "GET_BY_ID",
      getAll: "GET_ALL",
      create: "add",
      update: "MODIFY",
      delete: "DELETE"
    };

    // -------------------------------------------
    // PROCESS CURRENT RESOURCES (NEW + UPDATED)
    // -------------------------------------------
    rolePermissions.resources.forEach((currentResource) => {
      const originalResource = originalPermissions.resources.find(
        (r) => r.name === currentResource.name
      );

      const actionsToAdd: string[] = [];
      const actionsToDelete: string[] = [];

      // -------------------------------------------
      // NEW RESOURCE → add all enabled permissions
      // -------------------------------------------
      if (!originalResource) {
        (Object.entries(permissionToActionMap) as [PermissionKey, string][])
          .forEach(([permKey, actionName]) => {
            if (currentResource.permissions[permKey]) {
              actionsToAdd.push(actionName);
            }
          });

        if (actionsToAdd.length > 0) {
          savePromises.push(
            roleResourceAPI.updateRoleResourcePermission(
              rolePermissions.role,
              currentResource.name,
              actionsToAdd,
              "ADD"
            )
          );
        }

        return; // go to next resource
      }

      // -------------------------------------------
      // EXISTING RESOURCE → detect diffs
      // -------------------------------------------
      (Object.entries(permissionToActionMap) as [PermissionKey, string][])
        .forEach(([permKey, actionName]) => {
          const wasChecked = originalResource.permissions[permKey];
          const isChecked = currentResource.permissions[permKey];

          if (wasChecked !== isChecked) {
            if (isChecked) actionsToAdd.push(actionName);
            else actionsToDelete.push(actionName);
          }
        });

      // ADD changed permissions
      if (actionsToAdd.length > 0) {
        savePromises.push(
          roleResourceAPI.updateRoleResourcePermission(
            rolePermissions.role,
            currentResource.name,
            actionsToAdd,
            "ADD"
          )
        );
      }

      // DELETE changed permissions
      if (actionsToDelete.length > 0) {
        savePromises.push(
          roleResourceAPI.updateRoleResourcePermission(
            rolePermissions.role,
            currentResource.name,
            actionsToDelete,
            "DELETE"
          )
        );
      }
    });

    // -------------------------------------------
    // PROCESS REMOVED RESOURCES
    // -------------------------------------------
    originalPermissions.resources.forEach((originalResource) => {
      const currentResource = rolePermissions.resources.find(
        (r) => r.name === originalResource.name
      );

      if (!currentResource) {
        const actionsToDelete: string[] = [];

        (Object.entries(permissionToActionMap) as [PermissionKey, string][])
          .forEach(([permKey, actionName]) => {
            if (originalResource.permissions[permKey]) {
              actionsToDelete.push(actionName);
            }
          });

        if (actionsToDelete.length > 0) {
          savePromises.push(
            roleResourceAPI.updateRoleResourcePermission(
              rolePermissions.role,
              originalResource.name,
              actionsToDelete,
              "DELETE"
            )
          );
        }
      }
    });

    // -------------------------------------------
    // EXECUTE API CALLS
    // -------------------------------------------
    console.log("Saving permissions - Total API calls:", savePromises.length);

    await Promise.all(savePromises);

    // Update state
    setOriginalPermissions(JSON.parse(JSON.stringify(rolePermissions)));
    setHasChanges(false);

    alert("Permissions saved successfully!");
  } catch (error) {
    console.error("Error saving permissions:", error);
    alert("Error saving permissions. Please try again.");
  }
};

 if (loading) {
    return (
      <div className={appContentStyles.viewRoleResourcePage || viewRoleResourceMappingPageStyles.viewRoleResourcePage}>
        <div className={appContentStyles.viewRoleResourceLoading || viewRoleResourceMappingPageStyles.viewRoleResourceLoading}>
          <div className={appContentStyles.loadingSpinner || viewRoleResourceMappingPageStyles.loadingSpinner}>Loading role permissions for {roleName}...</div>
        </div>
      </div>
    );
  }

  // If no rolePermissions after loading, show empty state
  if (!rolePermissions) {
    return (
      <div className={appContentStyles.viewRoleResourcePage || viewRoleResourceMappingPageStyles.viewRoleResourcePage}>
        <div className={appContentStyles.viewRoleResourceHeader || viewRoleResourceMappingPageStyles.viewRoleResourceHeader}>
          <h1 className={appContentStyles.pageTitle || viewRoleResourceMappingPageStyles.pageTitle}>Role Resource Mapping</h1>
          <div className={appContentStyles.breadcrumb || viewRoleResourceMappingPageStyles.breadcrumb}>
            <span className={appContentStyles.breadcrumbItem || viewRoleResourceMappingPageStyles.breadcrumbItem}>
              <button className={appContentStyles.breadcrumbLink || viewRoleResourceMappingPageStyles.breadcrumbLink} onClick={() => navigate('/admin')}>IAM</button>
            </span>
            <span className={appContentStyles.breadcrumbItem || viewRoleResourceMappingPageStyles.breadcrumbItem}>
              <button className={appContentStyles.breadcrumbLink || viewRoleResourceMappingPageStyles.breadcrumbLink} onClick={() => navigate('/admin/role-resource-mapping')}>
                Role Resource Mapping
              </button>
            </span>
            <span className={`${appContentStyles.breadcrumbItem || viewRoleResourceMappingPageStyles.breadcrumbItem} ${appContentStyles.active || viewRoleResourceMappingPageStyles.active}`}>{roleName || 'Unknown'}</span>
          </div>
        </div>
        <div className={appContentStyles.viewRoleResourceContent || viewRoleResourceMappingPageStyles.viewRoleResourceContent}>
          <div className={appContentStyles.permissionsContainer || viewRoleResourceMappingPageStyles.permissionsContainer}>
            <h2 className={appContentStyles.roleTitle || viewRoleResourceMappingPageStyles.roleTitle}>{roleName || 'Unknown Role'}</h2>
            <p>No permissions found for this role. Please check the API response.</p>
            <button className={`${appContentStyles.btn || viewRoleResourceMappingPageStyles.btn} ${appContentStyles.btnPrimary || viewRoleResourceMappingPageStyles.btnPrimary}`} onClick={() => navigate('/admin/role-resource-mapping')}>
              Back to Role Resource Mapping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // At this point, rolePermissions is guaranteed to be non-null
  const permissions = rolePermissions;
  return (
    <div className={appContentStyles.viewRoleResourcePage || viewRoleResourceMappingPageStyles.viewRoleResourcePage}>
      <div className={appContentStyles.viewRoleResourceHeader || viewRoleResourceMappingPageStyles.viewRoleResourceHeader}>
        <h1 className={appContentStyles.pageTitle || viewRoleResourceMappingPageStyles.pageTitle}>Role Resource Mapping</h1>
        <div className={appContentStyles.breadcrumb || viewRoleResourceMappingPageStyles.breadcrumb}>
          <span className={appContentStyles.breadcrumbItem || viewRoleResourceMappingPageStyles.breadcrumbItem}>
            <button className={appContentStyles.breadcrumbLink || viewRoleResourceMappingPageStyles.breadcrumbLink} onClick={() => navigate('/admin')}>IAM</button>
          </span>
          <span className={appContentStyles.breadcrumbItem || viewRoleResourceMappingPageStyles.breadcrumbItem}>
            <button className={appContentStyles.breadcrumbLink || viewRoleResourceMappingPageStyles.breadcrumbLink} onClick={() => navigate('/admin/role-resource-mapping')}>
              Role Resource Mapping
            </button>
          </span>
          <span className={`${appContentStyles.breadcrumbItem || viewRoleResourceMappingPageStyles.breadcrumbItem} ${appContentStyles.active || viewRoleResourceMappingPageStyles.active}`}>{permissions.role}</span>
        </div>
      </div>

      <div className={appContentStyles.viewRoleResourceContent || viewRoleResourceMappingPageStyles.viewRoleResourceContent}>
        <div className={appContentStyles.permissionsContainer || viewRoleResourceMappingPageStyles.permissionsContainer}>
          <h2 className={appContentStyles.roleTitle || viewRoleResourceMappingPageStyles.roleTitle}>{permissions.role}</h2>
          
          <div className={appContentStyles.permissionsTableContainer || viewRoleResourceMappingPageStyles.permissionsTableContainer}>
            <table className={appContentStyles.permissionsTable || viewRoleResourceMappingPageStyles.permissionsTable}>
              <thead>
                <tr>
                  <th className={appContentStyles.resourceHeader || viewRoleResourceMappingPageStyles.resourceHeader}>
                    <input 
                      type="checkbox" 
                      className={appContentStyles.selectAllCheckbox || viewRoleResourceMappingPageStyles.selectAllCheckbox}
                      checked={isAllSelected()}
                      onChange={(e) => handleSelectAllChange(e.target.checked)}
                    />
                    Resources
                  </th>
                  <th className={appContentStyles.permissionHeader || viewRoleResourceMappingPageStyles.permissionHeader}>
                    <input 
                      type="checkbox" 
                      className={appContentStyles.permissionCheckbox || viewRoleResourceMappingPageStyles.permissionCheckbox}
                      checked={isOperationFullySelected('getById')}
                      onChange={(e) => handleOperationCheckboxChange('getById', e.target.checked)}
                    />
                    GET_BY_ID
                  </th>
                  <th className={appContentStyles.permissionHeader || viewRoleResourceMappingPageStyles.permissionHeader}>
                    <input 
                      type="checkbox" 
                      className={appContentStyles.permissionCheckbox || viewRoleResourceMappingPageStyles.permissionCheckbox}
                      checked={isOperationFullySelected('getAll')}
                      onChange={(e) => handleOperationCheckboxChange('getAll', e.target.checked)}
                    />
                    GET_ALL
                  </th>
                  <th className={appContentStyles.permissionHeader || viewRoleResourceMappingPageStyles.permissionHeader}>
                    <input 
                      type="checkbox" 
                      className={appContentStyles.permissionCheckbox || viewRoleResourceMappingPageStyles.permissionCheckbox}
                      checked={isOperationFullySelected('create')}
                      onChange={(e) => handleOperationCheckboxChange('create', e.target.checked)}
                    />
                    add
                  </th>
                  <th className={appContentStyles.permissionHeader || viewRoleResourceMappingPageStyles.permissionHeader}>
                    <input 
                      type="checkbox" 
                      className={appContentStyles.permissionCheckbox || viewRoleResourceMappingPageStyles.permissionCheckbox}
                      checked={isOperationFullySelected('update')}
                      onChange={(e) => handleOperationCheckboxChange('update', e.target.checked)}
                    />
                    MODIFY
                  </th>
                  <th className={appContentStyles.permissionHeader || viewRoleResourceMappingPageStyles.permissionHeader}>
                    <input 
                      type="checkbox" 
                      className={appContentStyles.permissionCheckbox || viewRoleResourceMappingPageStyles.permissionCheckbox}
                      checked={isOperationFullySelected('delete')}
                      onChange={(e) => handleOperationCheckboxChange('delete', e.target.checked)}
                    />
                    DELETE
                  </th>
                </tr>
              </thead>
              <tbody>
                {permissions.resources && permissions.resources.length > 0 ? (
                  permissions.resources.map((resource, index) => (
                    <tr key={resource.name} className={index % 2 === 0 ? (appContentStyles.rowEven || viewRoleResourceMappingPageStyles.rowEven) : (appContentStyles.rowOdd || viewRoleResourceMappingPageStyles.rowOdd)}>
                    <td className={appContentStyles.resourceCell || viewRoleResourceMappingPageStyles.resourceCell}>
                      <input 
                        type="checkbox" 
                        className={appContentStyles.resourceCheckbox || viewRoleResourceMappingPageStyles.resourceCheckbox}
                        checked={isResourceFullySelected(resource.name)}
                        onChange={(e) => handleResourceCheckboxChange(resource.name, e.target.checked)}
                      />
                      {resource.name}
                    </td>
                    <td className={appContentStyles.permissionCell || viewRoleResourceMappingPageStyles.permissionCell}>
                      <input
                        type="checkbox"
                        checked={resource.permissions.getById}
                        onChange={(e) => handlePermissionChange(resource.name, 'getById', e.target.checked)}
                        className={appContentStyles.permissionCheckbox || viewRoleResourceMappingPageStyles.permissionCheckbox}
                      />
                    </td>
                    <td className={appContentStyles.permissionCell || viewRoleResourceMappingPageStyles.permissionCell}>
                      <input
                        type="checkbox"
                        checked={resource.permissions.getAll}
                        onChange={(e) => handlePermissionChange(resource.name, 'getAll', e.target.checked)}
                        className={appContentStyles.permissionCheckbox || viewRoleResourceMappingPageStyles.permissionCheckbox}
                      />
                    </td>
                    <td className={appContentStyles.permissionCell || viewRoleResourceMappingPageStyles.permissionCell}>
                      <input
                        type="checkbox"
                        checked={resource.permissions.create}
                        onChange={(e) => handlePermissionChange(resource.name, 'create', e.target.checked)}
                        className={appContentStyles.permissionCheckbox || viewRoleResourceMappingPageStyles.permissionCheckbox}
                      />
                    </td>
                    <td className={appContentStyles.permissionCell || viewRoleResourceMappingPageStyles.permissionCell}>
                      <input
                        type="checkbox"
                        checked={resource.permissions.update}
                        onChange={(e) => handlePermissionChange(resource.name, 'update', e.target.checked)}
                        className={appContentStyles.permissionCheckbox || viewRoleResourceMappingPageStyles.permissionCheckbox}
                      />
                    </td>
                    <td className={appContentStyles.permissionCell || viewRoleResourceMappingPageStyles.permissionCell}>
                      <input
                        type="checkbox"
                        checked={resource.permissions.delete}
                        onChange={(e) => handlePermissionChange(resource.name, 'delete', e.target.checked)}
                        className={appContentStyles.permissionCheckbox || viewRoleResourceMappingPageStyles.permissionCheckbox}
                      />
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      No resources found. Please check the API response.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={appContentStyles.saveSection || viewRoleResourceMappingPageStyles.saveSection}>
            <button 
              className={`${appContentStyles.btn || viewRoleResourceMappingPageStyles.btn} ${appContentStyles.btnSave || viewRoleResourceMappingPageStyles.btnSave} ${hasChanges ? (appContentStyles.hasChanges || viewRoleResourceMappingPageStyles.hasChanges) : ''}`}
              onClick={handleSave}
              disabled={!hasChanges}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRoleResourceMappingPage;
