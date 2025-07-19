// FranchiseSidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Users,
  DollarSign,
  UserPlus,
  X,
  Menu,
} from 'lucide-react';

interface FranchiseSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Technicians', href: '/technicians', icon: Users },
  { name: 'Earnings', href: '/earnings', icon: DollarSign },
  { name: 'Refer Technician', href: '/refer', icon: UserPlus },
];

const FranchiseSidebar: React.FC<FranchiseSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen
}) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow"
      >
        <Menu size={20} />
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">FS</span>
            </div>
            <span className="ml-3 font-semibold text-gray-800 text-lg">Franchise</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="mt-6 px-4">
          <nav className="space-y-2">
            {menuItems.map(({ name, href, icon: Icon }) => {
              const isActive = location.pathname === href;

              return (
                <Link
                  key={name}
                  to={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-blue-100 text-blue-600 shadow-inner'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  `}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200
                      ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                  />
                  {name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default FranchiseSidebar;


// import React from 'react';
// import { GrDashboard } from 'react-icons/gr';
// import { User, User2, UserPlus, Menu, X } from 'lucide-react';
// import { BiMoney } from 'react-icons/bi';

// interface FranchiseSidebarProps {
//   showSidebarMobile: boolean;
//   setShowSidebarMobile: (value: boolean) => void;
//   activeTab: string;
//   setActiveTab: (tab: string) => void;
// }

// const FranchiseSidebar: React.FC<FranchiseSidebarProps> = ({
//   showSidebarMobile,
//   setShowSidebarMobile,
//   activeTab,
//   setActiveTab,
// }) => {
//   const menuItems = [
//     { key: 'dashboard', label: 'Dashboard', icon: <GrDashboard size={20} /> },
//     { key: 'profile', label: 'Profile', icon: <User size={20} /> },
//     { key: 'technicians', label: 'Technicians', icon: <User2 size={20} /> },
//     { key: 'earnings', label: 'Earnings', icon: <BiMoney size={20} /> },
//     { key: 'refer', label: 'Refer Technician', icon: <UserPlus size={20} /> },
//   ];

//   const handleTabClick = (key: string) => {
//     setActiveTab(key);
//     if (window.innerWidth < 768) {
//       setShowSidebarMobile(false);
//     }
//     const newPath = key === 'dashboard' ? '/' : `/${key}`;
//     window.history.pushState(null, '', newPath);
//   };

//   const SidebarContent = ({ isMobile = false }) => (
//     <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col">
//       {/* Header */}
//       <div className="p-4 border-b border-gray-200">
//         {isMobile ? (
//           <div className="flex justify-between items-center">
//             <h2 className="text-lg font-semibold text-gray-800">Franchise</h2>
//             <button
//               onClick={() => setShowSidebarMobile(false)}
//               className="p-1 hover:bg-gray-100 rounded"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         ) : (
//           <div>
//             <h2 className="text-lg font-semibold text-gray-800">Franchise</h2>
//           </div>
//         )}
//       </div>

//       {/* Nav items */}
//       <nav className="flex-1 p-2">
//         <div className="space-y-1">
//           {menuItems.map((item) => (
//             <button
//               key={item.key}
//               onClick={() => handleTabClick(item.key)}
//               className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-all duration-200 group ${
//                 activeTab === item.key
//                   ? 'bg-blue-100 text-blue-700 border border-blue-300'
//                   : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
//               }`}
//             >
//               <span
//                 className={`${
//                   activeTab === item.key
//                     ? 'text-blue-600'
//                     : 'text-gray-500 group-hover:text-gray-700'
//                 }`}
//               >
//                 {item.icon}
//               </span>
//               <span className="font-medium">{item.label}</span>
//             </button>
//           ))}
//         </div>
//       </nav>
//     </div>
//   );

//   return (
//     <>
//       {/* Mobile Menu Button */}
//       <button
//         onClick={() => setShowSidebarMobile(true)}
//         className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md border border-gray-200"
//       >
//         <Menu size={20} />
//       </button>

//       {/* Desktop Sidebar */}
//       <div className="hidden md:flex fixed top-0 left-0 h-screen z-30">
//         <SidebarContent />
//       </div>

//       {/* Mobile Sidebar Overlay */}
//       {showSidebarMobile && (
//         <div
//           className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden"
//           onClick={() => setShowSidebarMobile(false)}
//         >
//           <div
//             className="bg-white h-full shadow-xl w-64"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <SidebarContent isMobile />
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default FranchiseSidebar;
