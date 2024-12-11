import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import styled from 'styled-components';

const StyledLogoutButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--dedsec-blue);
  color: var(--dedsec-blue);
  font-family: 'Share Tech Mono', monospace;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 229, 255, 0.1);
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
    transform: translateY(-2px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 100%;
    background: var(--dedsec-blue);
    transform: translateX(-4px);
    transition: transform 0.2s ease;
  }

  &:hover::before {
    transform: translateX(0);
  }
`;

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The AuthContext will automatically update and redirect to login
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <StyledLogoutButton onClick={handleLogout}>
      DISCONNECT
    </StyledLogoutButton>
  );
};

export default LogoutButton; 