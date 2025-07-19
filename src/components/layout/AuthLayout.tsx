import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <main className="flex items-center justify-center">
      <div className="w-full max-w-screen-md bg-white rounded-lg shadow-lg">
        <Outlet />
      </div>
    </main>
  );
};

export default AuthLayout;
