import React from 'react';
import appContentStyles from '../AppContent.module.css';
import headerStyles from './Header.module.css';

interface HeaderProps {
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

 return (
    <header className={appContentStyles.header || headerStyles.header}>
      <div className={appContentStyles.headerContent || headerStyles.headerContent}>
        <div className={appContentStyles.headerLeft || headerStyles.headerLeft}>
          {/* Empty for now, can add logo or title if needed */}
        </div>
        <div className={appContentStyles.headerRight || headerStyles.headerRight}>
          <button className={appContentStyles.logoutButton || headerStyles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
