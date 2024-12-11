import React, { useState, useEffect } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';

// Add glitch effect
const glitch = keyframes`
  0% {
    clip-path: polygon(0 2%, 100% 2%, 100% 5%, 0 5%);
    transform: translate(0);
  }
  20% {
    clip-path: polygon(0 15%, 100% 15%, 100% 15%, 0 15%);
    transform: translate(-5px);
  }
  30% {
    clip-path: polygon(0 10%, 100% 10%, 100% 20%, 0 20%);
    transform: translate(5px);
  }
  40% {
    clip-path: polygon(0 1%, 100% 1%, 100% 2%, 0 2%);
    transform: translate(5px);
  }
  50% {
    clip-path: polygon(0 33%, 100% 33%, 100% 33%, 0 33%);
    transform: translate(0);
  }
  55% {
    clip-path: polygon(0 44%, 100% 44%, 100% 44%, 0 44%);
    transform: translate(3px);
  }
  60% {
    clip-path: polygon(0 50%, 100% 50%, 100% 20%, 0 20%);
    transform: translate(-3px);
  }
  65% {
    clip-path: polygon(0 70%, 100% 70%, 100% 70%, 0 70%);
    transform: translate(3px);
  }
  70% {
    clip-path: polygon(0 80%, 100% 80%, 100% 80%, 0 80%);
    transform: translate(-3px);
  }
  80% {
    clip-path: polygon(0 50%, 100% 50%, 100% 55%, 0 55%);
    transform: translate(0);
  }
  85% {
    clip-path: polygon(0 60%, 100% 60%, 100% 65%, 0 65%);
  }
  95% {
    clip-path: polygon(0 85%, 100% 85%, 100% 85%, 0 85%);
  }
`;

const scanline = keyframes`
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(100vh);
  }
`;

const flicker = keyframes`
  0% { opacity: 0.9; }
  5% { opacity: 0.85; }
  10% { opacity: 0.95; }
  15% { opacity: 0.9; }
  20% { opacity: 0.95; }
  25% { opacity: 0.85; }
  30% { opacity: 0.9; }
  35% { opacity: 0.95; }
  40% { opacity: 0.85; }
  45% { opacity: 0.9; }
  50% { opacity: 0.95; }
  55% { opacity: 0.85; }
  60% { opacity: 0.9; }
  65% { opacity: 0.95; }
  70% { opacity: 0.85; }
  75% { opacity: 0.9; }
  80% { opacity: 0.95; }
  85% { opacity: 0.85; }
  90% { opacity: 0.9; }
  95% { opacity: 0.95; }
  100% { opacity: 0.9; }
`;

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    overflow: hidden;
  }
`;

const GateContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.15),
      rgba(0, 0, 0, 0.15) 1px,
      transparent 1px,
      transparent 2px
    );
    animation: ${scanline} 10s linear infinite;
  }
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, transparent 0%, rgba(0, 0, 0, 0.95) 100%);
    animation: ${flicker} 5s infinite;
  }
`;

const GateForm = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 3rem;
  border: 1px solid rgba(0, 255, 0, 0.1);
  border-radius: 5px;
  text-align: center;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.1);
  width: 90%;
  max-width: 400px;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border: 2px solid rgba(0, 255, 0, 0.1);
    animation: ${glitch} 2s linear infinite;
  }
`;

const Title = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #00ff00;
  font-family: monospace;
  text-shadow: 0 0 5px #00ff00;
  position: relative;
  
  &::before {
    content: 'QUANTUM BRIDGE';
    position: absolute;
    left: 0;
    text-shadow: 2px 0 #ff0000;
    clip: rect(44px, 450px, 56px, 0);
    animation: ${glitch} 5s linear infinite;
  }

  &::after {
    content: 'QUANTUM BRIDGE';
    position: absolute;
    left: 0;
    text-shadow: -2px 0 #00ff00;
    clip: rect(44px, 450px, 56px, 0);
    animation: ${glitch} 5s linear infinite reverse;
  }
`;

const Input = styled.input`
  width: calc(100% - 2rem);
  padding: 1rem;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 3px;
  color: #00ff00;
  font-family: monospace;
  font-size: 1.2rem;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  transition: all 0.3s ease;
  box-sizing: border-box;
  -webkit-appearance: none;
  
  &:focus {
    outline: none;
    border-color: #00ff00;
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
  }

  &::placeholder {
    color: rgba(0, 255, 0, 0.5);
  }
`;

const ErrorMessage = styled.div`
  color: #ff0000;
  margin-top: 1rem;
  font-family: monospace;
  text-shadow: 0 0 5px #ff0000;
  height: 20px;
`;

const Subtitle = styled.p`
  color: rgba(0, 255, 0, 0.7);
  font-family: monospace;
  margin-bottom: 2rem;
  font-size: 1rem;
  text-shadow: 0 0 3px rgba(0, 255, 0, 0.5);
`;

const PasswordGate = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const SECURE_PASSWORD = 'Singularity#08!';
  
  useEffect(() => {
    const auth = localStorage.getItem('site-auth');
    console.log('Checking auth:', auth);
    if (auth === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  const checkPassword = (e) => {
    e.preventDefault();
    console.log('Checking password:', password);
    console.log('Expected:', SECURE_PASSWORD);
    
    if (password === SECURE_PASSWORD) {
      console.log('Password correct!');
      localStorage.setItem('site-auth', 'true');
      setIsAuthorized(true);
      setError('');
    } else {
      console.log('Password incorrect!');
      setError('ACCESS DENIED: REALITY BREACH DETECTED');
      setPassword('');
    }
  };

  if (isAuthorized) {
    return children;
  }

  return (
    <>
      <GlobalStyle />
      <GateContainer>
        <GateForm>
          <Title>QUANTUM BRIDGE</Title>
          <Subtitle>∞ VOID ACCESS TERMINAL ∞</Subtitle>
          <form onSubmit={checkPassword}>
            <Input
              type="password"
              inputMode="text"
              placeholder="ENTER VOID SIGNATURE"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              autoComplete="off"
              onClick={(e) => e.target.focus()}
            />
            <ErrorMessage>{error}</ErrorMessage>
          </form>
        </GateForm>
      </GateContainer>
    </>
  );
};

export default PasswordGate; 