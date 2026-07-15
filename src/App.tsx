import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';
import { KioskClock } from './components/KioskClock';
import { KioskEnroll } from './pages/KioskEnroll';
import { StaffManagement } from './components/StaffManagement';
import { RolesManagement } from './components/RolesManagement';
import { DashboardLayout } from './components/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { MenuCategoryManagement } from './components/MenuCategoryManagement';
import { MenuItemManagement } from './components/MenuItemManagement';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('access_token');
  return token ? <DashboardLayout>{children}</DashboardLayout> : <Navigate to="/" />;
};

function App() {
  return (
    <Routes>
      {/* Public Login Entrance */}
      <Route path="/" element={<LoginForm />} />


      {/* Protected Layout Canvas Panes */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/kiosk" element={<PrivateRoute><KioskClock /></PrivateRoute>} />
      <Route path="/enroll" element={<PrivateRoute><KioskEnroll /></PrivateRoute>} />
      <Route path="/staff" element={<PrivateRoute><StaffManagement /></PrivateRoute>} />
      <Route path="/roles" element={<PrivateRoute><RolesManagement /></PrivateRoute>} />
      <Route path="/menu-categories" element={<PrivateRoute><MenuCategoryManagement /></PrivateRoute>} />
      <Route path="/menu-items" element={<PrivateRoute><MenuItemManagement /></PrivateRoute>} />

      {/* Fallback Catch-All Redirector */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;


// App.tsx
// import React, { useState } from 'react';
// import { LivenessComponent } from 'pv-liveness-sdk';

// const App: React.FC = () => {
//   const [isVerified, setIsVerified] = useState(false);

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
//       <h1>Identity Verification</h1>

//       {!isVerified ? (
//         <LivenessComponent
//           width={640}
//           height={480}
//           onSuccess={() => setIsVerified(true)}
//           onStateChange={(state) => console.log("Current state:", state)}
//         />
//       ) : (
//         <div style={{ padding: '20px', backgroundColor: '#4CAF50', color: 'white', borderRadius: '8px' }}>
//           <h2>✅ You have been successfully verified!</h2>
//           <p>Proceeding to the next step of the application...</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;