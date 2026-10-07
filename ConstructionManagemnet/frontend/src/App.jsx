import { authApi } from './api/authApi';
import React, { useState, useEffect } from 'react';
import LoginPage from './components/auth/LoginPage';
import Navbar from './components/layout/Navbar';
import DashboardView from './components/dashboard/DashboardView';
import ProjectList from './components/project/ProjectList';
import InspectionList from './components/inspection/InspectionList';
import TaskList from './components/task/TaskList';
import InventoryList from './components/inventory/InventoryList';
import WorkforceList from './components/workforce/WorkforceList';
import FinanceList from './components/finance/FinanceList';
import AdminConsole from './components/admin/AdminConsole';
import ClientPortalView from './components/client/ClientPortalView';

export default function App() {
  // Session user state. Null means user needs to log in on full-screen LoginPage
  const [user, setUser] = useState(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;
    const expired = () => setUser(null);
    window.addEventListener('session-expired', expired);
    authApi.session().then(account => {
      if (active) {
        setUser(account);
        setActiveTab(account.role === 'CLIENT' ? 'client-portal' : account.role === 'ADMIN' ? 'admin' : 'dashboard');
      }
    }).catch(() => {}).finally(() => { if (active) setCheckingSession(false); });
    return () => { active = false; window.removeEventListener('session-expired', expired); };
  }, []);

  const handleLogin = (userInfo) => {
    setUser(userInfo);
    if (userInfo.role === 'ADMIN') {
      setActiveTab('admin');
    } else if (userInfo.role === 'CLIENT') {
      setActiveTab('client-portal');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = async () => {
    try { await authApi.logout(); setUser(null); } catch (error) { alert(error.message); }
  };

  // If user is not logged in, render standalone full-screen Login Page
  if (checkingSession) return <div className="content-area">Loading session...</div>;
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (user.role === 'CLIENT') return <ClientPortalView />;
    if (user.role === 'SUPERVISOR' && ['projects', 'finance'].includes(activeTab)) return <DashboardView onNavigate={setActiveTab} />;
    if (activeTab === 'admin' && user.role !== 'ADMIN') return <DashboardView onNavigate={setActiveTab} />;
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'projects':
        return <ProjectList />;
      case 'inspections':
        return <InspectionList />;
      case 'tasks':
        return <TaskList />;
      case 'inventory':
        return <InventoryList />;
      case 'workforce':
        return <WorkforceList />;
      case 'finance':
        return <FinanceList />;
      case 'admin':
        return <AdminConsole />;
      case 'client-portal':
        return <ClientPortalView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="app-container">
      <div className="main-wrapper">
        <Navbar
          currentRole={user.role}
          onNavigate={setActiveTab}
          activeTab={activeTab}
          currentUser={user}
          onLogout={handleLogout}
        />
        <main className="content-area">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
