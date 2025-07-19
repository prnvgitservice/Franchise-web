import React, { useState } from 'react';
import FranchiseSidebar from '../FranchiseHomePage/FranchiseSidebar';
import { Outlet } from 'react-router-dom';

const FranchiseLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex gap-4 min-h-screen max-w-7xl mx-auto">
      <FranchiseSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1 ml-0 transition-all duration-300 max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
};

export default FranchiseLayout;
