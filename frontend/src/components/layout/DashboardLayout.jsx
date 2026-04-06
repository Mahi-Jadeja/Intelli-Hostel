import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/**
 * DashboardLayout - The main layout wrapper for authenticated pages
 *
 * Structure:
 * ┌──────────┬──────────────────────┐
 * │          │      TopBar          │
 * │  Sidebar │──────────────────────│
 * │          │                      │
 * │          │      Content         │
 * │          │      (children)      │
 * │          │                      │
 * └──────────┴──────────────────────┘
 *
 * On mobile, the sidebar is hidden and toggled via hamburger menu.
 */
const DashboardLayout = ({ children }) => {
  // State for mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* flex-1: takes up all remaining space after sidebar */}
        {/* flex flex-col: stack TopBar and content vertically */}

        {/* Top Bar */}
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
          {/* Whatever page component is passed as children renders here */}
          {/* e.g., <Overview />, <Profile />, <Room /> */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;