import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

/**
 * DashboardLayout
 *
 * Wraps all authenticated pages.
 * Handles mobile sidebar toggle and responsive structure.
 */
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {/* Clicking the dark background closes the sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Bar */}
        {/* Visible only on small screens (lg:hidden) */}
        <header className="bg-white border-b border-gray-200 lg:hidden sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            <span className="text-lg font-bold text-indigo-900">IntelliHostel</span>

            {/* Spacer to balance the layout */}
            <div className="w-6" />
          </div>
        </header>

        {/* Page Content */}
        {/* p-4 for mobile, p-6 for tablet, p-8 for desktop */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;