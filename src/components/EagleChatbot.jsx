import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Send } from '@mui/icons-material';

const matrixBg = keyframes`
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
`;

const glowingText = keyframes`
  0% { text-shadow: 0 0 5px #0f0, 0 0 10px #0f0, 0 0 15px #0f0; }
  50% { text-shadow: 0 0 10px #0f0, 0 0 20px #0f0, 0 0 30px #0f0; }
  100% { text-shadow: 0 0 5px #0f0, 0 0 10px #0f0, 0 0 15px #0f0; }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: 
    linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)),
    repeating-linear-gradient(
      0deg,
      rgba(0, 255, 0, 0.1) 0%,
      rgba(0, 255, 0, 0.1) 1px,
      transparent 1px,
      transparent 2px
    );
  background-size: 200% 200%;
  animation: ${matrixBg} 15s linear infinite;
  padding: 20px;
  overflow-y: auto;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 40px);
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(0, 20, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.2);
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 20px;
    border: 1px solid rgba(0, 255, 0, 0.2);
    animation: ${glowingText} 2s ease-in-out infinite;
    pointer-events: none;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;
  color: #0f0;
  font-size: 2.5em;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  animation: ${glowingText} 2s ease-in-out infinite;
  text-transform: uppercase;
  letter-spacing: 3px;
`;

const ChatMessages = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  border-radius: 15px;
  background: rgba(0, 20, 0, 0.5);
  margin-bottom: 20px;
  border: 1px solid rgba(0, 255, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 10px;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0, 255, 0, 0.1);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 0, 0.3);
    border-radius: 4px;
  }
`;

const messageAppear = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Message = styled.div`
  margin: 10px;
  padding: 15px;
  border-radius: 10px;
  max-width: 85%;
  width: fit-content;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
  animation: ${messageAppear} 0.3s ease-out;
  
  ${props => props.isUser ? `
    margin-left: auto;
    background: rgba(0, 255, 0, 0.1);
    color: #0f0;
    border: 1px solid rgba(0, 255, 0, 0.3);
  ` : `
    margin-right: auto;
    background: rgba(0, 20, 0, 0.8);
    color: #0f0;
    border: 1px solid rgba(0, 255, 0, 0.3);
  `}
`;

const InputContainer = styled.div`
  display: flex;
  gap: 15px;
  padding: 20px;
  background: rgba(0, 20, 0, 0.8);
  border-radius: 15px;
  border: 1px solid rgba(0, 255, 0, 0.2);
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 15px 25px;
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 25px;
  background: rgba(0, 20, 0, 0.8);
  color: #0f0;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(0, 255, 0, 0.5);
  }

  &:focus {
    outline: none;
    border-color: #0f0;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
  }
`;

const SendButton = styled.button`
  padding: 15px;
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 50%;
  background: rgba(0, 20, 0, 0.8);
  color: #0f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 255, 0, 0.1);
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProcessingIndicator = styled.div`
  text-align: center;
  color: #0f0;
  padding: 10px;
  font-family: 'Courier New', monospace;
  animation: ${glowingText} 1.5s ease-in-out infinite;
`;

const EagleChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userInput) => {
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: userInput })
      });
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I'm having trouble processing your request. Please try again later.";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setIsProcessing(true);

    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    const aiResponse = await getAIResponse(userMessage);
    setMessages(prev => [...prev, { text: aiResponse, isUser: false }]);
    
    setIsProcessing(false);
  };

  return (
    <PageContainer>
      <ChatContainer>
        <Header>EAGLE AI Assistant</Header>
        <ChatMessages>
          {messages.map((message, index) => (
            <Message key={index} isUser={message.isUser}>
              {message.text}
            </Message>
          ))}
          {isProcessing && (
            <ProcessingIndicator>EAGLE is thinking...</ProcessingIndicator>
          )}
          <div ref={messagesEndRef} />
        </ChatMessages>
        <InputContainer>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isProcessing ? "Processing..." : "Type your message..."}
            disabled={isProcessing}
          />
          <SendButton onClick={handleSend} disabled={isProcessing}>
            <Send />
          </SendButton>
        </InputContainer>
      </ChatContainer>
    </PageContainer>
  );
};

export default EagleChatbot; 