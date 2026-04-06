import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * TopBar - Horizontal bar at the top of the content area
 * Shows a hamburger menu (mobile) and page context
 *
 * @param {function} onMenuClick - Toggle the sidebar
 */
const TopBar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between lg:px-6">
      {/* Hamburger menu button — only visible on mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Right side — user greeting */}
      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-gray-500">
          Welcome,{' '}
          <span className="font-medium text-gray-900">{user?.name}</span>
        </span>
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
};

export default TopBar;