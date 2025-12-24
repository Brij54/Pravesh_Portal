import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationItem } from '../../types';
import sidebarStyles from './Sidebar.module.css';
import appContentStyles from '../AppContent.module.css';

interface SidebarProps {
  activeItem: string;
  onItemClick: (itemId: string) => void;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin/dashboard',
  },
  {
    id: 'access-management',
    label: 'Access management',
    children: [
      {
        id: 'users',
        label: 'Users',
        path: '/admin/users',
      },
      {
        id: 'roles',
        label: 'Roles',
        path: '/admin/roles',
      },
      {
        id: 'user-role-mapping',
        label: 'User Role Mapping',
        path: '/admin/user-role-mapping',
      },
      {
        id: 'role-resource-mapping',
        label: 'Role Resource Mapping',
        path: '/admin/role-resource-mapping',
      },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick }) => {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['access-management']));

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleItemClick = (item: NavigationItem) => {
    const hasChildren = item.children && item.children.length > 0;
    
    // If item has children and no path, toggle expansion
    if (hasChildren && !item.path) {
      toggleExpanded(item.id);
    } else {
      // Otherwise, navigate if path exists
      onItemClick(item.id);
      if (item.path) {
        navigate(item.path);
      }
    }
  };

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isActive = activeItem === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = hasChildren && expandedItems.has(item.id);

    return (
      <div key={item.id} className={`${(appContentStyles.navItem || sidebarStyles.navItem)} level-${level}`}>
        <div
          className={`${(appContentStyles.navItemContent || sidebarStyles.navItemContent)} ${isActive ? (appContentStyles.active || sidebarStyles.active) : ''}`}
          onClick={() => handleItemClick(item)}
        >
          {hasChildren && (
            <span className={`${(appContentStyles.navArrow || sidebarStyles.navArrow)} ${isExpanded ? (appContentStyles.expanded || sidebarStyles.expanded) : ''}`}>
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          <span className={appContentStyles.navLabel || sidebarStyles.navLabel}>{item.label}</span>
        </div>
        {hasChildren && isExpanded && (
          <div className={appContentStyles.navChildren || sidebarStyles.navChildren}>
            {item.children!.map((child) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={appContentStyles.sidebar || sidebarStyles.sidebar}>
      <div className={appContentStyles.sidebarHeader || sidebarStyles.sidebarHeader}>
        <h2 className={appContentStyles.sidebarTitle || sidebarStyles.sidebarTitle} title="Identity and Access Management">
          IAM
        </h2>
      </div>
      <nav className={appContentStyles.sidebarNav || sidebarStyles.sidebarNav}>
        {navigationItems.map((item) => renderNavigationItem(item))}
      </nav>
    </div>
  );
};

export default Sidebar;