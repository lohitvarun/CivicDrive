import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { NewReport } from './components/NewReport';
import { MyReports } from './components/MyReports';
import { TrafficMapLayers } from './components/TrafficMapLayers';
import { Certificates } from './components/Certificates';
import { ActivityLog } from './components/ActivityLog';
import { RoadHazards } from './components/RoadHazards';
import { SafetyInsights } from './components/SafetyInsights';
import { CivicAI } from './components/CivicAI';
import { Toast } from './components/Toast';

const MainContent = () => {
  const { user, activeTab, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#63b3ff' }}>
        <h2>Loading CivicDrive...</h2>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <Navbar />

      <main>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'new-report' && <NewReport />}
        {activeTab === 'my-reports' && <MyReports />}
        {activeTab === 'map-layers' && <TrafficMapLayers />}
        {activeTab === 'certificates' && <Certificates />}
        {activeTab === 'activity' && <ActivityLog />}
        {activeTab === 'hazards' && <RoadHazards />}
        {activeTab === 'insights' && <SafetyInsights />}
        {activeTab === 'civic-ai' && <CivicAI />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Toast />
      <MainContent />
    </AuthProvider>
  );
}
