import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, limit, where, getDocs, deleteDoc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import styled, { keyframes } from 'styled-components';
import { Lock, Send, Shield, Warning, Close, Image, Mic, EmojiEmotions, VideoCall } from '@mui/icons-material';
import SecureBackground from './SecureBackground';

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px var(--dedsec-green); }
  50% { box-shadow: 0 0 20px var(--dedsec-green); }
  100% { box-shadow: 0 0 5px var(--dedsec-green); }
`;

const scanlineAnimation = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const typeAnimation = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const ChatContainer = styled.div`
    display: grid;
    grid-template-rows: auto 1fr auto;
    height: calc(100vh - 40px);
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid var(--dedsec-green);
    border-radius: 10px;
    overflow: hidden;
    width: 100%;
    max-width: 1200px;
    margin: 20px auto;
    position: relative;
`;

const Header = styled.div`
    padding: 20px;
    background: rgba(0, 255, 159, 0.1);
    border-bottom: 1px solid var(--dedsec-green);
    display: flex;
    align-items: center;
    gap: 10px;

    h2 {
        color: var(--dedsec-green);
        font-size: 1.2em;
        letter-spacing: 2px;
    }
`;

const MessagesContainer = styled.div`
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
    height: 100%;
    align-items: stretch;
    position: relative;
    
    &::-webkit-scrollbar {
        width: 5px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 255, 159, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: var(--dedsec-green);
        border-radius: 5px;
    }
`;

const Message = styled.div`
    width: fit-content;
    max-width: 70%;
    padding: 15px;
    border-radius: ${props => props.sent ? '15px 15px 0 15px' : '15px 15px 15px 0'};
    background: ${props => props.sent ? 'rgba(0, 255, 159, 0.05)' : 'rgba(0, 229, 255, 0.05)'};
    border: 1px solid ${props => props.sent ? 'var(--dedsec-green)' : 'var(--dedsec-blue)'};
    align-self: ${props => props.sent ? 'flex-end' : 'flex-start'};
    margin: 5px 15px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
`;

const MessageMeta = styled.div`
    font-size: 0.8em;
    color: ${props => props.sent ? 'var(--dedsec-green)' : 'var(--dedsec-blue)'};
    opacity: 0.7;
    margin-top: 5px;
`;

const InputContainer = styled.div`
    padding: 20px;
    background: rgba(0, 0, 0, 0.95);
    border-top: 1px solid var(--dedsec-green);
    position: relative;
    z-index: 10;
    backdrop-filter: blur(5px);
    box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.8);
    width: 100%;
`;

const InputForm = styled.form`
    display: flex;
    gap: 10px;
    position: relative;
    z-index: 11;
    width: 100%;
    align-items: center;
`;

const MessageInput = styled.input`
    flex: 1;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid var(--dedsec-green);
    color: var(--dedsec-green);
    padding: 10px 15px;
    border-radius: 20px;
    font-family: 'Share Tech Mono', monospace;
    min-height: 40px;

    &:focus {
        outline: none;
        box-shadow: 0 0 10px var(--dedsec-green);
    }
`;

const SendButton = styled.button`
    background: transparent;
    border: 1px solid var(--dedsec-green);
    color: var(--dedsec-green);
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 5px;
    font-family: 'Share Tech Mono', monospace;
    transition: all 0.3s ease;

    &:hover {
        background: var(--dedsec-green);
        color: black;
    }
`;

const WarningPopup = styled.div`
    position: absolute;
    top: 80px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid var(--dedsec-green);
    padding: 15px 20px;
    border-radius: 5px;
    color: var(--dedsec-green);
    display: ${props => props.show ? 'flex' : 'none'};
    align-items: center;
    gap: 10px;
    max-width: 300px;
    animation: ${glowAnimation} 2s infinite;
    z-index: 1000;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 5px;
    right: 5px;
    background: transparent;
    border: none;
    color: var(--dedsec-green);
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        color: white;
    }
`;

const WarningText = styled.span`
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.9em;
    letter-spacing: 1px;
`;

const FileInput = styled.input`
  display: none;
`;

const AttachmentButton = styled.button`
  background: transparent;
  border: none;
  color: var(--dedsec-green);
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    color: var(--dedsec-blue);
  }
`;

const AttachmentBar = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  z-index: 11;
  margin-bottom: 12px;
  border: 1px solid rgba(0, 255, 159, 0.1);
  backdrop-filter: blur(5px);
`;

const MediaMessage = styled.div`
  width: fit-content;
  height: fit-content;
  max-width: 780px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(0, 255, 159, 0.05);
  border: 1px solid var(--dedsec-green);
  margin: 8px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 255, 159, 0.1);

  &:hover {
    background: rgba(0, 255, 159, 0.1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 255, 159, 0.2);
  }

  img {
    display: block;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: calc(100vh - 300px);
    border-radius: 8px;
    object-fit: contain;
    transition: transform 0.3s ease;
  }

  audio {
    display: block;
    width: 300px;
    height: 40px;
    border-radius: 20px;
    background: transparent;
    &::-webkit-media-controls-panel {
      background: rgba(0, 255, 159, 0.05);
      border-radius: 20px;
      border: 1px solid rgba(0, 255, 159, 0.2);
    }
    &::-webkit-media-controls-current-time-display,
    &::-webkit-media-controls-time-remaining-display {
      color: var(--dedsec-green);
      font-family: 'Share Tech Mono', monospace;
    }
    &::-webkit-media-controls-play-button {
      background-color: var(--dedsec-green);
      border-radius: 50%;
      transform: scale(1.2);
    }
    &::-webkit-media-controls-timeline {
      background-color: rgba(0, 255, 159, 0.1);
      border-radius: 10px;
      height: 4px;
    }
  }

  video {
    display: block;
    width: 100%;
    max-width: 600px;
    height: auto;
    max-height: calc(100vh - 300px);
    border-radius: 8px;
    background: black;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const FullscreenOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  cursor: pointer;
  padding: 20px;
`;

const FullscreenContent = styled.div`
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  
  img {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
    border: 2px solid var(--dedsec-green);
    border-radius: 5px;
    box-shadow: 0 0 20px rgba(0, 255, 159, 0.3);
  }
`;

const EmojiPickerContainer = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 1000;
`;

const EmojiButton = styled(AttachmentButton)`
  color: var(--dedsec-green);
  &:hover {
    color: var(--dedsec-blue);
  }
`;

const UploadProgress = styled.div`
    width: 100%;
    height: 3px;
    background: rgba(0, 255, 159, 0.1);
    margin: 8px 0;
    position: relative;
    border-radius: 1.5px;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: ${props => props.progress}%;
        background: var(--dedsec-green);
        transition: width 0.3s ease;
        box-shadow: 0 0 10px var(--dedsec-green);
    }
`;

const MessageContent = ({ msg, loadFileContent, handleImageClick }) => {
    const [contentCache, setContentCache] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadContent = async () => {
            if (contentCache[msg.fileId]) {
                return;
            }

            if ((msg.type === 'image' || msg.type === 'audio' || msg.type === 'video') && msg.status === 'completed') {
                setLoading(true);
                try {
                    console.log(`Loading ${msg.type} with fileId:`, msg.fileId);
                    const data = await loadFileContent(msg.fileId);
                    console.log("Content loaded:", data ? "success" : "failed");
                    if (data) {
                        setContentCache(prev => ({
                            ...prev,
                            [msg.fileId]: data
                        }));
                    } else {
                        console.error("No content received for fileId:", msg.fileId);
                    }
                } catch (error) {
                    console.error(`Error loading ${msg.type}:`, error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadContent();
    }, [msg.fileId, msg.type, msg.status, loadFileContent]);

    if (loading && !contentCache[msg.fileId]) {
        return <div>Loading {msg.type}...</div>;
    }

    if (msg.type === 'image' && contentCache[msg.fileId]) {
        return (
            <MediaMessage onClick={() => handleImageClick(contentCache[msg.fileId])}>
                <img 
                    src={contentCache[msg.fileId]} 
                    alt={msg.fileName || 'Image'} 
                    style={{ 
                        maxWidth: '300px', 
                        maxHeight: '300px', 
                        objectFit: 'contain' 
                    }} 
                />
            </MediaMessage>
        );
    }

    if (msg.type === 'audio' && contentCache[msg.fileId]) {
        return (
            <MediaMessage>
                <audio 
                    controls 
                    src={contentCache[msg.fileId]}
                    style={{ 
                        width: '300px',
                        height: '40px'
                    }}
                >
                    Your browser does not support the audio element.
                </audio>
            </MediaMessage>
        );
    }

    if (msg.type === 'video' && contentCache[msg.fileId]) {
        return (
            <MediaMessage>
                <video 
                    controls 
                    src={contentCache[msg.fileId]}
                    style={{ 
                        maxWidth: '400px',
                        maxHeight: '300px',
                        borderRadius: '10px'
                    }}
                >
                    Your browser does not support the video element.
                </video>
            </MediaMessage>
        );
    }

    if ((msg.type === 'image' || msg.type === 'audio' || msg.type === 'video') && !contentCache[msg.fileId]) {
        return <div>Failed to load {msg.type}</div>;
    }

    return msg.text;
};

const MessageContentWrapper = styled.div`
    color: ${props => props.sent ? 'var(--dedsec-green)' : 'var(--dedsec-blue)'};
    position: relative;
    z-index: 1;
    width: fit-content;
    height: fit-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;

    &::-webkit-scrollbar {
        width: 5px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 255, 159, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: var(--dedsec-green);
        border-radius: 5px;
    }
`;

const AudioMessage = styled(MediaMessage)`
    audio {
        background: transparent;
        border-radius: 20px;
        &::-webkit-media-controls-panel {
            background: rgba(0, 255, 159, 0.1);
        }
        &::-webkit-media-controls-current-time-display,
        &::-webkit-media-controls-time-remaining-display {
            color: var(--dedsec-green);
        }
        &::-webkit-media-controls-play-button {
            background-color: var(--dedsec-green);
            border-radius: 50%;
        }
    }
`;

const VideoMessage = styled(MediaMessage)`
    video {
        background: black;
        &::-webkit-media-controls {
            background-color: rgba(0, 0, 0, 0.7);
        }
        &::-webkit-media-controls-panel {
            background-color: rgba(0, 0, 0, 0.7);
        }
        &::-webkit-media-controls-play-button {
            background-color: var(--dedsec-green);
            border-radius: 50%;
        }
        &::-webkit-media-controls-current-time-display,
        &::-webkit-media-controls-time-remaining-display {
            color: var(--dedsec-green);
        }
        &::-webkit-media-controls-timeline {
            background-color: rgba(0, 255, 159, 0.2);
            border-radius: 10px;
            height: 3px;
        }
    }
`;

const RecordingButton = styled(AttachmentButton)`
    color: ${props => props.isRecording ? '#ff4444' : 'var(--dedsec-green)'};
    position: relative;
    transition: all 0.3s ease;
    padding: 8px;
    border-radius: 50%;
    background: ${props => props.isRecording ? 'rgba(255, 68, 68, 0.1)' : 'transparent'};

    &:after {
        content: '';
        position: absolute;
        width: ${props => props.isRecording ? '100%' : '0%'};
        height: 100%;
        background: ${props => props.isRecording ? 'rgba(255, 68, 68, 0.15)' : 'rgba(0, 255, 159, 0.15)'};
        border-radius: 50%;
        transition: all 0.3s ease;
        top: 0;
        left: 0;
    }

    &:hover {
        transform: scale(1.1);
        color: ${props => props.isRecording ? '#ff4444' : 'var(--dedsec-blue)'};
        background: ${props => props.isRecording ? 'rgba(255, 68, 68, 0.15)' : 'rgba(0, 255, 159, 0.1)'};
    }
`;

const RecordingTimer = styled.div`
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%);
    color: ${props => props.isRecording ? '#ff4444' : 'var(--dedsec-green)'};
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.9em;
    background: rgba(0, 0, 0, 0.8);
    padding: 4px 8px;
    border-radius: 4px;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    border: 1px solid ${props => props.isRecording ? '#ff4444' : 'var(--dedsec-green)'};
`;

const Tooltip = styled.div`
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: var(--dedsec-green);
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 0.8em;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;

    ${RecordingButton}:hover & {
        opacity: 1;
    }
`;

const SecurityWarning = styled.div`
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(255, 0, 0, 0.1);
    border: 1px solid #ff4444;
    padding: 10px 20px;
    border-radius: 5px;
    color: #ff4444;
    font-size: 0.9em;
    z-index: 1000;
`;

const MessageSender = styled.div`
    font-size: 0.8em;
    color: ${props => props.sent ? 'var(--dedsec-green)' : 'var(--dedsec-blue)'};
    opacity: 0.8;
`;

const SecureChat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [showWarning, setShowWarning] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const [userId] = useState(auth.currentUser?.uid || 'anonymous');
    const [uploading, setUploading] = useState(false);
    const imageInputRef = useRef(null);
    const audioInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fullscreenImage, setFullscreenImage] = useState(null);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioRecorder, setAudioRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const recordingTimerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        let currentUserId = auth.currentUser?.uid;

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user && currentUserId) {
                console.log("User logged out, cleaning up messages for:", currentUserId);
                await cleanupUserMessages(currentUserId);
                currentUserId = null;
            } else if (user) {
                currentUserId = user.uid;
            }
        });

        return () => {
            unsubscribe();
            if (currentUserId) {
                cleanupUserMessages(currentUserId);
            }
        };
    }, []);

    useEffect(() => {
        const loadMessages = async () => {
            if (!auth.currentUser) {
                setMessages([]);
                return;
            }

            try {
                // Query all messages without filtering by uid
                const q = query(
                    collection(db, 'secureMessages')
                );

                const unsubscribe = onSnapshot(q, {
                    next: (snapshot) => {
                        const newMessages = snapshot.docs
                            .map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            }))
                            // Sort messages by timestamp
                            .sort((a, b) => {
                                const timeA = a.timestamp?.toMillis() || 0;
                                const timeB = b.timestamp?.toMillis() || 0;
                                return timeA - timeB;
                            });
                        setMessages(newMessages);
                        scrollToBottom();
                    },
                    error: (error) => {
                        console.error("Messages snapshot error:", error);
                        setError("Failed to load messages");
                        setMessages([]);
                    }
                });

                return () => unsubscribe();
            } catch (error) {
                console.error("Error setting up messages listener:", error);
                setError("Failed to setup message loading");
                setMessages([]);
            }
        };

        loadMessages();
    }, [auth.currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            if (!auth.currentUser) {
                setError("Please sign in to send messages");
                return;
            }

            const messageData = {
                text: message.trim(),
                sender: auth.currentUser.email,
                timestamp: serverTimestamp(),
                uid: auth.currentUser.uid,
                type: 'text',
                createdAt: serverTimestamp(),
                autoDestruct: true
            };

            await addDoc(collection(db, 'secureMessages'), messageData);
            console.log("Message sent successfully");
            
            setMessage('');
            setError(null);

        } catch (error) {
            console.error("Error sending message:", error);
            setError(`Failed to send message: ${error.message}`);
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : timestamp;
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleFileSelect = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // Prevent multiple uploads
        if (uploading) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            console.log("Generated fileId:", fileId, "Type:", type);

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const base64Data = e.target.result;
                    const chunkSize = 500 * 1024;
                    const chunks = [];
                    
                    for (let i = 0; i < base64Data.length; i += chunkSize) {
                        chunks.push(base64Data.slice(i, i + chunkSize));
                    }

                    console.log(`File split into ${chunks.length} chunks`);

                    // Upload each chunk
                    for (let i = 0; i < chunks.length; i++) {
                        await addDoc(collection(db, 'fileChunks'), {
                            fileId: fileId,
                            chunk: chunks[i],
                            index: i,
                            totalChunks: chunks.length,
                            timestamp: serverTimestamp(),
                            uid: auth.currentUser.uid,
                            mimeType: file.type
                        });
                        
                        const progress = ((i + 1) / chunks.length) * 100;
                        setUploadProgress(progress);
                        console.log(`Uploaded chunk ${i + 1}/${chunks.length}`);
                    }

                    // Create the message
                    await addDoc(collection(db, 'secureMessages'), {
                        text: file.name,
                        sender: auth.currentUser.email,
                        timestamp: serverTimestamp(),
                        uid: auth.currentUser.uid,
                        type: type,
                        fileId: fileId,
                        fileName: file.name,
                        status: 'completed',
                        totalChunks: chunks.length,
                        mimeType: file.type,
                        createdAt: serverTimestamp(),
                        autoDestruct: true
                    });

                    console.log("Message created successfully");
                    setError(null);
                } catch (error) {
                    console.error("Error in file upload process:", error);
                    setError(`Upload failed: ${error.message}`);
                } finally {
                    setUploading(false);
                    setUploadProgress(0);
                }
            };

            reader.onerror = (error) => {
                console.error("FileReader error:", error);
                setError("Error reading file");
                setUploading(false);
            };

            console.log("Starting file read...");
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Error in handleFileSelect:", error);
            setError(`Upload failed: ${error.message}`);
            setUploading(false);
        }

        // Clear the input value after handling the file
        e.target.value = '';
    };

    const loadFileContent = async (fileId) => {
        try {
            console.log("Fetching chunks for fileId:", fileId);
            const chunksQuery = query(
                collection(db, 'fileChunks'),
                where('fileId', '==', fileId),
                orderBy('index')
            );

            const snapshot = await getDocs(chunksQuery);
            console.log("Found chunks:", snapshot.size);

            if (snapshot.empty) {
                console.error("No chunks found for fileId:", fileId);
                return null;
            }

            // Combine all chunks in order
            const chunks = snapshot.docs.map(doc => doc.data().chunk);
            const completeBase64 = chunks.join('');
            console.log("Chunks combined, total length:", completeBase64.length);
            
            return completeBase64;
        } catch (error) {
            console.error("Error in loadFileContent:", error);
            throw error;
        }
    };

    const handleImageClick = (imageData) => {
        setFullscreenImage(imageData);
        document.body.style.overflow = 'hidden';
    };

    const closeFullscreen = () => {
        setFullscreenImage(null);
        document.body.style.overflow = 'auto';
    };

    const onEmojiClick = (emojiData, event) => {
        setMessage(prevMessage => prevMessage + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const handleLogout = async () => {
        try {
            const userMessages = query(
                collection(db, 'secureMessages'),
                where('uid', '==', auth.currentUser.uid)
            );
            const snapshot = await getDocs(userMessages);
            
            for (const doc of snapshot.docs) {
                const data = doc.data();
                if (data.isFileMetadata) {
                    const fileQuery = query(
                        collection(db, 'fileContents'),
                        where('fileId', '==', data.fileId)
                    );
                    const fileSnapshot = await getDocs(fileQuery);
                    fileSnapshot.docs.forEach(async (fileDoc) => {
                        await deleteDoc(fileDoc.ref);
                    });
                }
                await deleteDoc(doc.ref);
            }

            await auth.signOut();
        } catch (error) {
            console.error("Logout error:", error);
            setError(`Logout failed: ${error.message}`);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                const reader = new FileReader();
                
                reader.onload = async (e) => {
                    try {
                        const base64Data = e.target.result;
                        const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        const chunkSize = 500 * 1024;
                        const dataChunks = [];

                        for (let i = 0; i < base64Data.length; i += chunkSize) {
                            dataChunks.push(base64Data.slice(i, i + chunkSize));
                        }

                        // Upload chunks
                        for (let i = 0; i < dataChunks.length; i++) {
                            await addDoc(collection(db, 'fileChunks'), {
                                fileId: fileId,
                                chunk: dataChunks[i],
                                index: i,
                                totalChunks: dataChunks.length,
                                timestamp: serverTimestamp(),
                                uid: auth.currentUser.uid,
                                mimeType: 'audio/webm'
                            });
                        }

                        // Create message
                        await addDoc(collection(db, 'secureMessages'), {
                            text: `Voice Message (${formatRecordingTime(recordingTime)})`,
                            sender: auth.currentUser.email,
                            timestamp: serverTimestamp(),
                            uid: auth.currentUser.uid,
                            type: 'audio',
                            fileId: fileId,
                            fileName: `Voice Message.webm`,
                            status: 'completed',
                            totalChunks: dataChunks.length,
                            mimeType: 'audio/webm'
                        });

                    } catch (error) {
                        console.error("Error sending voice message:", error);
                        setError("Failed to send voice message");
                    }
                };

                reader.readAsDataURL(audioBlob);
            };

            setAudioRecorder(mediaRecorder);
            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Error starting recording:", error);
            setError("Could not access microphone");
        }
    };

    const stopRecording = () => {
        if (audioRecorder && audioRecorder.state === "recording") {
            audioRecorder.stop();
            audioRecorder.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            clearInterval(recordingTimerRef.current);
        }
    };

    const formatRecordingTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAudioClick = (e) => {
        let wasLongPress = false;
        
        // Set up long press detection
        const pressTimer = setTimeout(() => {
            wasLongPress = true;
            startRecording();
        }, 300);

        // Store both the timer and the long press flag
        e.currentTarget.dataset.pressTimer = pressTimer;
        e.currentTarget.dataset.wasLongPress = wasLongPress;
    };

    const handleAudioRelease = async (e) => {
        // Clear the press timer
        const pressTimer = e.currentTarget.dataset.pressTimer;
        if (pressTimer) {
            clearTimeout(pressTimer);
        }

        // Check if it was a long press
        const wasLongPress = e.currentTarget.dataset.wasLongPress === 'true';

        if (isRecording) {
            // If we were recording, stop it
            stopRecording();
        } else if (!wasLongPress && !uploading) {
            // Only open file explorer if it wasn't a long press and not currently uploading
            audioInputRef.current.click();
        }

        // Reset the long press flag
        e.currentTarget.dataset.wasLongPress = false;
    };

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
            if (audioRecorder) {
                audioRecorder.stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [audioRecorder]);

    // Add a cleanup function for component unmount
    useEffect(() => {
        return () => {
            // Cleanup any subscriptions or listeners
            setMessages([]);
            setError(null);
        };
    }, []);

    // Add this function to handle message cleanup
    const cleanupUserMessages = async (userId) => {
        if (!userId) return;

        try {
            // Get only the user's own messages
            const messagesQuery = query(
                collection(db, 'secureMessages'),
                where('uid', '==', userId)
            );
            
            const messagesSnapshot = await getDocs(messagesQuery);
            const batch = writeBatch(db);
            let operationCount = 0;

            // Delete only the user's messages
            for (const doc of messagesSnapshot.docs) {
                batch.delete(doc.ref);
                operationCount++;

                if (operationCount >= 500) {
                    await batch.commit();
                    operationCount = 0;
                }
            }

            if (operationCount > 0) {
                await batch.commit();
            }

            console.log("User messages cleaned up successfully");
        } catch (error) {
            console.error("Cleanup error:", error);
        }
    };

    return (
        <div>
            <SecureBackground />
            <ChatContainer>
                <SecurityWarning>
                    ⚠️ Messages will be destroyed upon logout
                </SecurityWarning>
                {fullscreenImage && (
                    <FullscreenOverlay onClick={closeFullscreen}>
                        <FullscreenContent onClick={e => e.stopPropagation()}>
                            <CloseButton onClick={closeFullscreen}>
                                <Close />
                            </CloseButton>
                            <img src={fullscreenImage} alt="Fullscreen view" />
                        </FullscreenContent>
                    </FullscreenOverlay>
                )}
                
                <WarningPopup show={showWarning}>
                    <Warning sx={{ color: 'var(--dedsec-green)' }} />
                    <WarningText>
                        SECURE NODE PROTOCOL ACTIVE: Messages will self-destruct after node cycle termination
                    </WarningText>
                    <CloseButton onClick={() => setShowWarning(false)}>
                        <Close sx={{ fontSize: 16 }} />
                    </CloseButton>
                </WarningPopup>

                {error && (
                    <WarningPopup show={true} style={{ top: '140px', background: 'rgba(255, 0, 0, 0.2)' }}>
                        <Warning sx={{ color: 'var(--error-red)' }} />
                        <WarningText style={{ color: 'var(--error-red)' }}>
                            {error}
                        </WarningText>
                        <CloseButton onClick={() => setError(null)} style={{ color: 'var(--error-red)' }}>
                            <Close sx={{ fontSize: 16 }} />
                        </CloseButton>
                    </WarningPopup>
                )}

                <Header>
                    <Shield sx={{ color: 'var(--dedsec-green)' }} />
                    <h2>SECURE CHANNEL</h2>
                    <Lock sx={{ color: 'var(--dedsec-green)' }} />
                </Header>

                <MessagesContainer>
                    {messages.map(msg => (
                        <Message 
                            key={msg.id} 
                            sent={msg.uid === auth.currentUser?.uid}
                        >
                            <MessageSender sent={msg.uid === auth.currentUser?.uid}>
                                {msg.sender}
                            </MessageSender>
                            <MessageContent 
                                msg={msg} 
                                loadFileContent={loadFileContent} 
                                handleImageClick={handleImageClick}
                            />
                            <MessageMeta sent={msg.uid === auth.currentUser?.uid}>
                                {formatTimestamp(msg.timestamp)}
                            </MessageMeta>
                        </Message>
                    ))}
                    <div ref={messagesEndRef} />
                </MessagesContainer>

                <InputContainer>
                    <InputForm onSubmit={handleSubmit}>
                        <AttachmentBar>
                            <EmojiButton 
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                <EmojiEmotions />
                            </EmojiButton>
                            <AttachmentButton 
                                type="button" 
                                onClick={() => imageInputRef.current.click()}
                            >
                                <Image />
                            </AttachmentButton>
                            <RecordingButton
                                type="button"
                                onMouseDown={handleAudioClick}
                                onMouseUp={handleAudioRelease}
                                onMouseLeave={(e) => {
                                    if (isRecording) {
                                        stopRecording();
                                    }
                                    handleAudioRelease(e);
                                }}
                                onTouchStart={handleAudioClick}
                                onTouchEnd={handleAudioRelease}
                                isRecording={isRecording}
                            >
                                <Mic />
                                {isRecording && (
                                    <RecordingTimer>
                                        {formatRecordingTime(recordingTime)}
                                    </RecordingTimer>
                                )}
                            </RecordingButton>
                            <AttachmentButton 
                                type="button" 
                                onClick={() => videoInputRef.current.click()}
                            >
                                <VideoCall />
                            </AttachmentButton>
                        </AttachmentBar>
                        
                        {uploading && (
                            <div style={{ textAlign: 'center', color: 'var(--dedsec-green)' }}>
                                Uploading: {Math.round(uploadProgress)}%
                                <UploadProgress progress={uploadProgress} />
                            </div>
                        )}
                        
                        {showEmojiPicker && (
                            <EmojiPickerContainer>
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    theme="dark"
                                    searchDisabled
                                    skinTonesDisabled
                                    height={400}
                                    width={300}
                                />
                            </EmojiPickerContainer>
                        )}
                        
                        <FileInput 
                            type="file" 
                            ref={imageInputRef}
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, 'image')}
                        />
                        <FileInput 
                            type="file" 
                            ref={audioInputRef}
                            accept="audio/*"
                            onChange={(e) => handleFileSelect(e, 'audio')}
                        />
                        <FileInput 
                            type="file" 
                            ref={videoInputRef}
                            accept="video/*"
                            onChange={(e) => handleFileSelect(e, 'video')}
                        />
                        
                        <MessageInput
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter secure message..."
                            disabled={uploading}
                        />
                        <SendButton type="submit" disabled={uploading}>
                            <Send sx={{ fontSize: 20 }} />
                            SEND
                        </SendButton>
                    </InputForm>
                </InputContainer>
            </ChatContainer>
        </div>
    );
};

export default SecureChat; 