import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import { DataProvider } from '../context/DataContext';
// import Sidebar from './layout/Sidebar';
import LogoutButton from './LogoutButton';
import Dashboard from './Dashboard';
import UsersPage from './Registration/UsersPage';
import AddUserPage from '../pages/users/AddUserPage';
import BulkUploadPage from '../pages/users/BulkUploadPage';
import ViewUserPage from '../pages/users/ViewUserPage';
import RolesPage from '../pages/roles/RolesPage';
import AddRolePage from '../pages/roles/AddRolePage';
import RolesBulkUploadPage from '../pages/roles/RolesBulkUploadPage';
import ViewRolePage from '../pages/roles/ViewRolePage';
import UserRoleMappingPage from '../pages/mappings/UserRoleMappingPage';
import ViewRoleResourceMappingPage from '../pages/mappings/ViewRoleResourceMappingPage';
import RoleResourceMappingPage from '../pages/mappings/RoleResourceMappingPage';
import ToastContainer from './ToastContainer';
// import '../components/AppContent.css';
import appComponentCCss from "../components/AppContent.module.css"





const AppContent: React.FC = () => {
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('authToken');
        setIsAuthenticated(!!token);
        setLoading(false);
    }, []);

    const [activeNavItem, setActiveNavItem] = useState(() => {
        const path = location.pathname;
        if (path === '/admin' || path === '/admin/') return 'dashboard';
        if (path.startsWith('/admin/users')) return 'users';
        if (path.startsWith('/admin/roles')) return 'roles';
        if (path.startsWith('/admin/user-role-mapping')) return 'user-role-mapping';
        if (path.startsWith('/admin/role-resource-mapping')) return 'role-resource-mapping';
        return 'dashboard';
    });

    const handleNavItemClick = (itemId: string) => {
        setActiveNavItem(itemId);
    };

    // Show loading while checking authentication
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    // If not authenticated and not on login page, redirect to login
    if (!isAuthenticated && location.pathname !== '/admin/login') {
        return <Navigate to="/admin/login" replace />;
    }

    // If authenticated and on login page, redirect to dashboard
    if (isAuthenticated && location.pathname === '/admin/login') {
        return <Navigate to="/admin" replace />;
    }

    // If not authenticated and on login page, show login page
    if (!isAuthenticated && location.pathname === '/admin/login') {
        return <LoginPage />;
    }

    return (
        <DataProvider>
            <div className={appComponentCCss.app}>
                {/* <Sidebar
                    activeItem={activeNavItem}
                    onItemClick={handleNavItemClick}
                /> */}
                <LogoutButton />
                <main className={appComponentCCss.mainContent}>
                     <Routes>
    {/* default admin home */}
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />

    {/* Users */}
    <Route path="users" element={<UsersPage />} />
    <Route path="users/add" element={<AddUserPage />} />
    <Route path="users/bulk-upload" element={<BulkUploadPage />} />
    <Route path="users/view/:username" element={<ViewUserPage />} />

    {/* Roles */}
    <Route path="roles" element={<RolesPage />} />
    <Route path="roles/add" element={<AddRolePage />} />
    <Route path="roles/bulk-upload" element={<RolesBulkUploadPage />} />
    <Route path="roles/view/:roleName" element={<ViewRolePage />} />

    {/* Mappings */}
    <Route path="user-role-mapping" element={<UserRoleMappingPage />} />
    <Route path="role-resource-mapping/view/:roleName" element={<ViewRoleResourceMappingPage />} />
    <Route path="role-resource-mapping" element={<RoleResourceMappingPage />} />
</Routes>
                    <ToastContainer />
                </main>
            </div>
        </DataProvider>
    );
};
export default AppContent;