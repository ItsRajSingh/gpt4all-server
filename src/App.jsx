import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import SecureChat from './components/SecureChat';
import Profile from './components/Profile';
import Projects from './components/Projects';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import styled from 'styled-components';
import ProfileSettings from './components/ProfileSettings';
import EagleChatbot from './components/EagleChatbot';
import PasswordGate from './components/PasswordGate';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--primary-color);
`;

const ContentContainer = styled.div`
  margin-left: ${props => props.isCollapsed ? '0' : '250px'};
  flex: 1;
  padding: 20px;
  padding-left: ${props => props.isCollapsed ? '50px' : '20px'};
  transition: all 0.3s ease;
`;

const DebugInfo = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px;
  border: 1px solid var(--dedsec-blue);
  color: var(--dedsec-blue);
  font-size: 12px;
`;

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log('Current user:', currentUser);

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-color)' }}>
        <Login />
      </div>
    );
  }

  return (
    <Router>
      <AppContainer>
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <ContentContainer isCollapsed={isCollapsed}>
          <DebugInfo>
            Logged in as: {currentUser?.email}
          </DebugInfo>
          <Routes>
            <Route path="/" element={<Navigate to="/main-chat" />} />
            <Route path="/main-chat" element={<Chat />} />
            <Route path="/secure-chat" element={<SecureChat />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/eagle-chatbot" element={<EagleChatbot />} />
            <Route path="*" element={<Navigate to="/main-chat" />} />
          </Routes>
        </ContentContainer>
      </AppContainer>
    </Router>
  );
}

function App() {
  return (
    <PasswordGate>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </PasswordGate>
  );
}

export default App;

