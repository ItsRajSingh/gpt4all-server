import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import styled, { keyframes } from 'styled-components';

const glitchAnim = keyframes`
  0% {
    clip-path: inset(40% 0 61% 0);
    transform: skew(0.15deg);
  }
  20% {
    clip-path: inset(92% 0 1% 0);
    transform: skew(0.3deg);
  }
  40% {
    clip-path: inset(43% 0 1% 0);
    transform: skew(0.45deg);
  }
  60% {
    clip-path: inset(25% 0 58% 0);
    transform: skew(0.6deg);
  }
  80% {
    clip-path: inset(54% 0 7% 0);
    transform: skew(0.45deg);
  }
  100% {
    clip-path: inset(58% 0 43% 0);
    transform: skew(0.3deg);
  }
`;

const scanlines = keyframes`
  0% {
    background-position: 0 -100vh;
  }
  100% {
    background-position: 0 100vh;
  }
`;

const LoginContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
    text-align: center;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: repeating-linear-gradient(
            transparent 0px,
            transparent 1px,
            rgba(0, 229, 255, 0.05) 2px,
            rgba(0, 229, 255, 0.05) 3px
        );
        animation: ${scanlines} 10s linear infinite;
        pointer-events: none;
    }
`;

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    max-width: 400px;
    width: 100%;
    padding: 40px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--dedsec-blue);
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);
    backdrop-filter: blur(5px);
    position: relative;

    &::before, &::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px solid transparent;
        animation: borderRotate 4s linear infinite;
    }

    &::after {
        animation: borderRotate 4s linear infinite reverse;
    }

    @keyframes borderRotate {
        0% {
            border-color: var(--dedsec-blue) transparent var(--dedsec-green) transparent;
        }
        50% {
            border-color: var(--dedsec-green) transparent var(--dedsec-blue) transparent;
        }
        100% {
            border-color: var(--dedsec-blue) transparent var(--dedsec-green) transparent;
        }
    }
`;

const Title = styled.h1`
    margin: 0;
    font-size: 2.5em;
    letter-spacing: 2px;
    position: relative;
    color: var(--dedsec-blue);
    text-shadow: 0 0 10px var(--dedsec-blue);

    &::before, &::after {
        content: 'INTERCONETHER';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        animation: ${glitchAnim} 2s infinite linear alternate-reverse;
    }

    &::before {
        color: var(--dedsec-green);
        left: 2px;
    }

    &::after {
        color: var(--dedsec-blue);
        left: -2px;
    }
`;

const Subtitle = styled.h2`
    margin: 10px 0 30px 0;
    font-size: 1.2em;
    color: var(--dedsec-green);
    letter-spacing: 3px;
    text-transform: uppercase;
    position: relative;
    text-shadow: 0 0 5px var(--dedsec-green);

    @keyframes subtitlePulse {
        0%, 100% { opacity: 0.8; filter: brightness(1); }
        50% { opacity: 0.4; filter: brightness(1.5); }
    }

    animation: subtitlePulse 4s infinite ease-in-out;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
    position: relative;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--dedsec-blue);
    color: var(--dedsec-blue);
    font-family: 'Share Tech Mono', monospace;
    font-size: 1em;
    box-sizing: border-box;
    transition: all 0.3s ease;
    pointer-events: auto;
    z-index: 1;

    &:focus {
        outline: none;
        border-color: var(--dedsec-green);
        box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
        transform: translateY(-2px);
    }

    &::placeholder {
        color: rgba(0, 229, 255, 0.5);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

const Button = styled.button`
    width: 100%;
    padding: 12px;
    margin-top: 10px;
    background: transparent;
    border: 1px solid var(--dedsec-blue);
    color: var(--dedsec-blue);
    font-family: 'Share Tech Mono', monospace;
    font-size: 1em;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    pointer-events: auto;
    z-index: 1;

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    &:hover:not(:disabled) {
        background: rgba(0, 229, 255, 0.1);
        box-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
        transform: translateY(-2px);
        letter-spacing: 2px;
    }
`;

const ErrorMessage = styled.div`
    color: var(--error-red);
    margin: 10px 0;
    text-align: center;
    text-shadow: 0 0 5px var(--error-red);
    animation: errorShake 0.5s ease-in-out;

    @keyframes errorShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleModeToggle = () => {
        setIsLogin(!isLogin);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (error) {
            console.error('Auth error:', error);
            setError(error.message
                .replace('Firebase:', '')
                .replace('Error', '')
                .trim());
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LoginContainer>
            <FormContainer>
                <Title>INTERCONETHER</Title>
                <Subtitle>We are watching</Subtitle>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <Form onSubmit={handleSubmit}>
                    <Input
                        type="email"
                        placeholder="ENTER EMAIL"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        disabled={isLoading}
                        autoComplete="off"
                    />
                    <Input
                        type="password"
                        placeholder="ENTER PASSWORD"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                    />
                    <Button 
                        type="submit" 
                        disabled={isLoading}
                    >
                        {isLoading ? 'PROCESSING...' : (isLogin ? 'ACCESS NETWORK' : 'CREATE NODE')}
                    </Button>
                    <Button 
                        type="button"
                        onClick={handleModeToggle}
                        disabled={isLoading}
                    >
                        {isLogin ? 'NEW NODE SETUP' : 'EXISTING NODE LOGIN'}
                    </Button>
                </Form>
            </FormContainer>
        </LoginContainer>
    );
};

export default Login;
