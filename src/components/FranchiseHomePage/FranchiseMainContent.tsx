// import React from 'react';
// import Dashboard from './Dashboard';
// import Profile from './Profile';
// import Technicians from './Technicians';
// import Earnings from './Earning';
// import ReferTechnician from './ReferTechnician';

// interface FranchiseMainContentProps {
//   showSidebarMobile: boolean;
//   activeTab: string;
// }

// const FranchiseMainContent: React.FC<FranchiseMainContentProps> = ({
//   showSidebarMobile,
//   activeTab,
// }) => {
//   const renderContent = () => {
//     switch (activeTab) {
//       case 'dashboard':
//         return <Dashboard />;
//       case 'profile':
//         return <Profile />;
//       case 'technicians':
//         return <Technicians />;
//       case 'earnings':
//         return <Earnings />;
//       case 'refer':
//         return <ReferTechnician />;
//       default:
//         return <Dashboard />;
//     }
//   };

//   return (
//     <div
//       className={`flex-1 overflow-y-auto transition-all duration-300 ${
//         showSidebarMobile ? 'md:blur-none' : ''
//       } p-1`}
//     >
//       <div className="max-w-6xl mx-auto">
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default FranchiseMainContent;
