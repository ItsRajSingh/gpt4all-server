import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, onSnapshot, where, setDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import styled, { keyframes, css } from 'styled-components';
import { ChevronLeft, ChevronRight, Send } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px var(--dedsec-blue); }
  50% { box-shadow: 0 0 15px var(--dedsec-blue); }
  100% { box-shadow: 0 0 5px var(--dedsec-blue); }
`;

const SidebarToggle = styled.button`
  position: fixed;
  left: 10px;
  top: 20px;
  width: 30px;
  height: 30px;
  background: var(--background-color);
  border: 1px solid var(--dedsec-blue);
  color: var(--dedsec-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 1000;

  &:hover {
    background: var(--dedsec-blue);
    color: var(--background-color);
    box-shadow: 0 0 10px var(--dedsec-blue);
  }
`;

const SidebarContainer = styled.div`
  width: ${props => props.isCollapsed ? '0' : '250px'};
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  border-right: ${props => props.isCollapsed ? 'none' : '1px solid var(--dedsec-blue)'};
  padding: ${props => props.isCollapsed ? '0' : '20px'};
  position: fixed;
  left: 0;
  top: 0;
  backdrop-filter: blur(5px);
  z-index: 100;
  transition: all 0.3s ease;
  overflow: hidden;
  visibility: ${props => props.isCollapsed ? 'hidden' : 'visible'};
`;

const NavSection = styled.div`
  margin-bottom: 30px;
  display: ${props => props.isCollapsed ? 'none' : 'block'};
  transition: opacity 0.2s ease;
`;

const SectionTitle = styled.h3`
  color: var(--dedsec-green);
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--dedsec-blue);
`;

const NavItem = styled.div`
  color: var(--dedsec-blue);
  padding: 10px;
  margin: 5px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background: rgba(0, 229, 255, 0.1);
    transform: translateX(5px);
  }

  &.active {
    background: rgba(0, 229, 255, 0.2);
    border-left: 3px solid var(--dedsec-blue);
  }
`;

const OnlineIndicator = styled.div`
  width: 8px;
  height: 8px;
  background-color: var(--dedsec-green);
  border-radius: 50%;
  margin-right: 10px;
  display: inline-block;
  animation: ${glowAnimation} 2s infinite;
`;

const CollapsedNav = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
  width: 100%;
`;

const CollapsedIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dedsec-blue);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  margin: 0 auto;

  &:hover {
    border: 1px solid var(--dedsec-blue);
    background: rgba(0, 229, 255, 0.1);
    border-radius: 5px;
  }

  &.active {
    background: rgba(0, 229, 255, 0.2);
    border: 1px solid var(--dedsec-blue);
    border-radius: 5px;
  }
`;

const NavLink = styled(Link)`
    color: var(--dedsec-green);
    text-decoration: none;
    padding: 0.5rem 1rem;
    transition: all 0.3s ease;
    position: relative;
    opacity: 0.7;

    &.active {
        opacity: 1;
        color: var(--dedsec-blue);
        
        &::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 100%;
            height: 2px;
            background: var(--dedsec-blue);
            animation: glow 1.5s ease-in-out infinite alternate;
        }
    }

    &:hover {
        opacity: 1;
    }

    @keyframes glow {
        from {
            box-shadow: 0 0 5px var(--dedsec-blue),
                       0 0 10px var(--dedsec-blue);
        }
        to {
            box-shadow: 0 0 10px var(--dedsec-blue),
                       0 0 20px var(--dedsec-blue);
        }
    }
`;

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const [activeSection, setActiveSection] = useState('main-chat');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!auth.currentUser) return;

        const userStatusRef = doc(db, 'onlineUsers', auth.currentUser.uid);

        const setUserOnline = async () => {
            await setDoc(userStatusRef, {
                email: auth.currentUser.email,
                lastSeen: serverTimestamp(),
                online: true
            });
        };

        const setUserOffline = async () => {
            await deleteDoc(userStatusRef);
        };

        setUserOnline();

        const q = query(
            collection(db, 'onlineUsers'),
            where('online', '==', true)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOnlineUsers(users);
        });

        return () => {
            unsubscribe();
            setUserOffline();
        };
    }, []);

    const handleNavigation = (path) => {
        setActiveSection(path);
        navigate(`/${path}`);
    };

    const getUserDisplayName = (email) => {
        return email ? email.split('@')[0].toUpperCase() : 'UNKNOWN NODE';
    };

    return (
        <>
            <SidebarToggle onClick={() => setIsCollapsed(!isCollapsed)}>
                {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </SidebarToggle>
            
            <SidebarContainer isCollapsed={isCollapsed}>
                {isCollapsed ? (
                    <CollapsedNav>
                        <CollapsedIcon 
                            onClick={() => handleNavigation('main-chat')}
                            className={activeSection === 'main-chat' ? 'active' : ''}
                        >
                            MC
                        </CollapsedIcon>
                        <CollapsedIcon 
                            onClick={() => handleNavigation('secure-chat')}
                            className={activeSection === 'secure-chat' ? 'active' : ''}
                        >
                            SC
                        </CollapsedIcon>
                        <CollapsedIcon 
                            onClick={() => handleNavigation('profile')}
                            className={activeSection === 'profile' ? 'active' : ''}
                        >
                            PR
                        </CollapsedIcon>
                        <CollapsedIcon 
                            onClick={() => handleNavigation('projects')}
                            className={activeSection === 'projects' ? 'active' : ''}
                        >
                            PJ
                        </CollapsedIcon>
                        <CollapsedIcon 
                            onClick={() => handleNavigation('eagle-chatbot')}
                            className={activeSection === 'eagle-chatbot' ? 'active' : ''}
                        >
                            <Send /> Eagle Chatbot
                        </CollapsedIcon>
                    </CollapsedNav>
                ) : (
                    <>
                        <NavSection>
                            <SectionTitle>NETWORK NODES</SectionTitle>
                            <NavItem 
                                className={activeSection === 'main-chat' ? 'active' : ''}
                                onClick={() => handleNavigation('main-chat')}
                            >
                                MAIN NETWORK
                            </NavItem>
                            <NavItem 
                                className={activeSection === 'secure-chat' ? 'active' : ''}
                                onClick={() => handleNavigation('secure-chat')}
                            >
                                SECURE CHANNEL
                            </NavItem>
                        </NavSection>

                        <NavSection>
                            <SectionTitle>ACTIVE NODES</SectionTitle>
                            {onlineUsers.map(user => (
                                <NavItem key={user.id}>
                                    <OnlineIndicator />
                                    {getUserDisplayName(user.email)}
                                </NavItem>
                            ))}
                        </NavSection>

                        <NavSection>
                            <SectionTitle>SYSTEM ACCESS</SectionTitle>
                            <NavItem 
                                className={activeSection === 'profile' ? 'active' : ''}
                                onClick={() => handleNavigation('profile')}
                            >
                                PERSONAL NODE
                            </NavItem>
                            <NavItem 
                                className={activeSection === 'projects' ? 'active' : ''}
                                onClick={() => handleNavigation('projects')}
                            >
                                PROTOCOL PROJECTS
                            </NavItem>
                            <NavItem 
                                className={activeSection === 'eagle-chatbot' ? 'active' : ''}
                                onClick={() => handleNavigation('eagle-chatbot')}
                            >
                                EAGLE AI NODE
                            </NavItem>
                        </NavSection>
                    </>
                )}
            </SidebarContainer>
        </>
    );
};

export default Sidebar; 