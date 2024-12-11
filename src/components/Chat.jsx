import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, where, limit, writeBatch, updateDoc, doc } from 'firebase/firestore';
import styled from 'styled-components';
import LogoutButton from './LogoutButton';
import { Image, Mic, VideoCall, AttachFile, StarBorder, Star } from '@mui/icons-material';
import MatrixBackground from './MatrixBackground';

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-height: 100vh;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 20px;
    background: transparent;
    z-index: 1;
    transform: translateZ(0);
    will-change: transform;
    backface-visibility: hidden;
    perspective: 1000;
`;

const ChatHeader = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: 0 0 10px 0;
    margin-bottom: 10px;
`;

const MessagesContainer = styled.div`
    flex: 1;
    overflow-y: scroll;
    padding: 20px;
    margin: 0;
    border-radius: 10px;
    background: rgba(0, 20, 20, 0.15);
    box-shadow: inset 0 0 20px rgba(0, 255, 159, 0.05);
    backdrop-filter: blur(3px);
    border: 1px solid rgba(0, 255, 159, 0.1);
    z-index: 2;
    
    /* Stable scrollbar */
    scrollbar-width: thin;
    scrollbar-gutter: stable;
    
    /* Prevent any layout shifts */
    contain: strict;
    
    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
        background: rgba(0, 255, 159, 0.2);
        border-radius: 3px;
    }

    /* Message text color adjustment for better visibility */
    color: rgba(255, 255, 255, 0.9);
`;

const InputContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
    margin-top: 10px;
    background: rgba(0, 20, 20, 0.15);
    backdrop-filter: blur(3px);
    border: 1px solid rgba(0, 255, 159, 0.1);
    border-radius: 10px;
    transform: translateZ(0);
    will-change: transform;
`;

const MessageInput = styled.textarea`
    background: rgba(0, 20, 20, 0.3);
    border: 1px solid rgba(0, 255, 159, 0.2);
    color: rgba(255, 255, 255, 0.9);
    border-radius: 5px;
    padding: 10px;
    width: 100%;
    min-height: 40px;
    resize: none;
    
    &::placeholder {
        color: rgba(255, 255, 255, 0.4);
    }
`;

const SendButton = styled.button`
    background: transparent;
    border: 1px solid var(--primary-color);
    color: var(--primary-color);
    padding: 10px;
    cursor: pointer;
    font-family: 'Share Tech Mono', monospace;
    
    &:hover {
        background: var(--primary-color);
        color: var(--background-color);
    }
`;

const MediaMessage = styled.div`
    width: fit-content;
    max-width: 400px;
    padding: 12px;
    border-radius: 12px;
    background: rgba(0, 255, 159, 0.05);
    border: 1px solid var(--primary-color);
    margin: 8px 0;

    img, video {
        max-width: 100%;
        border-radius: 8px;
    }

    audio {
        width: 300px;
    }
`;

const AttachmentBar = styled.div`
    display: flex;
    gap: 12px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    border: 1px solid var(--primary-color);
`;

const AttachmentButton = styled.button`
    background: transparent;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;

    &:hover {
        color: var(--background-color);
    }
`;

const FileInput = styled.input`
    display: none;
`;

const UploadProgress = styled.div`
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
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
        background: var(--primary-color);
        transition: width 0.3s ease;
    }
`;

const MessageActions = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
    opacity: 0;
    transition: all 0.3s ease;
    position: absolute;
    ${props => props.isSentByMe ? 'right: 15px;' : 'left: 15px;'}
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 20, 20, 0.8);
    padding: 5px;
    border-radius: 20px;
    backdrop-filter: blur(5px);
`;

const MessageWrapper = styled.div`
    position: relative;
    padding: 15px;
    margin: 8px 20px;
    border-radius: 12px;
    max-width: calc(70% - 40px);
    align-self: ${props => props.isSentByMe ? 'flex-start' : 'flex-end'};
    background: ${props => props.isArchived 
        ? 'rgba(0, 255, 159, 0.08)' 
        : props.isSentByMe
            ? 'rgba(0, 255, 159, 0.1)'
            : 'rgba(0, 20, 20, 0.7)'};
    border: 1px solid ${props => props.isArchived 
        ? 'var(--primary-color)' 
        : props.isSentByMe
            ? 'rgba(0, 255, 159, 0.2)'
            : 'rgba(0, 255, 159, 0.1)'};
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    
    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        border-color: rgba(0, 255, 159, 0.3);
        
        ${MessageActions} {
            opacity: 1;
        }
    }

    .message-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        strong {
            color: ${props => props.isSentByMe ? 'var(--dedsec-green)' : 'var(--primary-color)'};
            font-size: 0.9em;
            text-shadow: 0 0 10px rgba(0, 255, 159, 0.3);
            align-self: ${props => props.isSentByMe ? 'flex-start' : 'flex-end'};
        }

        p {
            margin: 0;
            word-break: break-word;
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.9);
            text-align: ${props => props.isSentByMe ? 'left' : 'right'};
        }
    }
`;

const ArchiveButton = styled.button`
    background: transparent;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
    border-radius: 50%;

    &:hover {
        transform: scale(1.1);
        background: rgba(0, 255, 159, 0.1);
        box-shadow: 0 0 15px rgba(0, 255, 159, 0.2);
    }
`;

const MessageTime = styled.span`
    font-size: 0.7em;
    color: rgba(0, 255, 159, 0.5);
    margin-top: 5px;
    align-self: ${props => props.isSentByMe ? 'flex-end' : 'flex-start'};
`;

const StyledLogoutButton = styled(LogoutButton)`
    background: rgba(0, 20, 20, 0.8);
    border: 1px solid rgba(0, 255, 159, 0.2);
    border-radius: 8px;
    padding: 8px 16px;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    
    &:hover {
        background: rgba(0, 255, 159, 0.1);
        border-color: rgba(0, 255, 159, 0.4);
        box-shadow: 0 0 15px rgba(0, 255, 159, 0.2);
    }
`;

const loadFileContent = async (fileId) => {
    try {
        const chunksQuery = query(
            collection(db, 'fileChunks'),
            where('fileId', '==', fileId),
            orderBy('index')
        );
        
        const chunksSnapshot = await getDocs(chunksQuery);
        let base64Data = '';
        
        chunksSnapshot.docs.forEach(doc => {
            base64Data += doc.data().chunk;
        });
        
        return base64Data;
    } catch (error) {
        console.error('Error loading file:', error);
        return null;
    }
};

const Chat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [audioRecorder, setAudioRecorder] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const imageInputRef = useRef(null);
    const audioInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const [isScrolled, setIsScrolled] = useState(true);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
        setIsScrolled(isAtBottom);
    };

    const scrollToBottom = (behavior = 'auto') => {
        if (messagesContainerRef.current && isScrolled) {
            const scrollHeight = messagesContainerRef.current.scrollHeight;
            const height = messagesContainerRef.current.clientHeight;
            const maxScrollTop = scrollHeight - height;
            messagesContainerRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const q = query(
            collection(db, 'messages'), 
            orderBy('timestamp', 'desc'),
            limit(50)  // Only load last 50 messages
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const messagesData = [];
            
            for (const doc of snapshot.docs) {
                const messageData = {
                    id: doc.id,
                    ...doc.data()
                };

                // Only load file content when message is viewed
                if (messageData.fileId && messageData.type) {
                    messageData.loadFile = async () => {
                        const fileContent = await loadFileContent(messageData.fileId);
                        if (fileContent) {
                            messageData.url = fileContent;
                            return fileContent;
                        }
                        return null;
                    };
                }

                messagesData.push(messageData);
            }

            setMessages(messagesData.reverse());
        });

        return () => unsubscribe();
    }, []);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default new line behavior
            if (message.trim()) {
                handleSubmit(e);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            await addDoc(collection(db, 'messages'), {
                text: message,
                sender: auth.currentUser.email,
                timestamp: serverTimestamp(),
                archived: false
            });

            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error sending message: ' + error.message);
        }
    };

    const handleFileSelect = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const reader = new FileReader();

            reader.onload = async (e) => {
                const base64Data = e.target.result;
                const chunkSize = 500 * 1024; // 500KB chunks
                const chunks = [];

                for (let i = 0; i < base64Data.length; i += chunkSize) {
                    chunks.push(base64Data.slice(i, i + chunkSize));
                }

                // Upload chunks
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

                    setUploadProgress(((i + 1) / chunks.length) * 100);
                }

                // Create message with file reference
                await addDoc(collection(db, 'messages'), {
                    text: file.name,
                    sender: auth.currentUser.email,
                    timestamp: serverTimestamp(),
                    type: type,
                    fileId: fileId,
                    fileName: file.name,
                    mimeType: file.type,
                    uid: auth.currentUser.uid,
                    archived: false
                });

                console.log("File uploaded successfully");
                setUploading(false);
                setUploadProgress(0);
            };

            reader.onerror = (error) => {
                console.error("Error reading file:", error);
                setUploading(false);
            };

            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploading(false);
        }

        // Clear the input
        e.target.value = '';
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
                
                const e = { target: { files: [file] } };
                handleFileSelect(e, 'audio');
            };

            recorder.start();
            setAudioRecorder(recorder);
            setIsRecording(true);

            // Start recording timer
            const startTime = Date.now();
            const timerInterval = setInterval(() => {
                setRecordingTime(Date.now() - startTime);
            }, 1000);

            recorder.onstart = () => {
                recorder.timerInterval = timerInterval;
            };
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        if (audioRecorder && audioRecorder.state === 'recording') {
            clearInterval(audioRecorder.timerInterval);
            audioRecorder.stop();
            audioRecorder.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            setRecordingTime(0);
        }
    };

    const LazyMediaMessage = ({ message }) => {
        const [loaded, setLoaded] = useState(false);
        const [content, setContent] = useState(null);

        const loadContent = async () => {
            if (!loaded && message.loadFile) {
                const fileContent = await message.loadFile();
                if (fileContent) {
                    setContent(fileContent);
                    setLoaded(true);
                }
            }
        };

        useEffect(() => {
            if (message.type && !loaded) {
                loadContent();
            }
        }, [message]);

        if (!loaded) {
            return <div>Loading media...</div>;
        }

        return (
            <MediaMessage>
                {message.type === 'image' && (
                    <img src={content} alt={message.fileName} />
                )}
                {message.type === 'audio' && (
                    <audio controls>
                        <source src={content} type={message.mimeType} />
                    </audio>
                )}
                {message.type === 'video' && (
                    <video controls>
                        <source src={content} type={message.mimeType} />
                    </video>
                )}
            </MediaMessage>
        );
    };

    const toggleArchive = async (messageId, currentArchiveState) => {
        try {
            await updateDoc(doc(db, 'messages', messageId), {
                archived: !currentArchiveState
            });
            console.log(`Message ${currentArchiveState ? 'unarchived' : 'archived'} successfully`);
        } catch (error) {
            console.error('Error toggling archive:', error);
        }
    };

    return (
        <>
            <MatrixBackground />
            <ChatContainer>
                <ChatHeader>
                    <StyledLogoutButton />
                </ChatHeader>
                <MessagesContainer 
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                >
                    {messages.map((msg, index) => {
                        const isSentByMe = msg.sender === auth.currentUser?.email;
                        const isLastMessage = index === messages.length - 1;
                        
                        return (
                            <MessageWrapper 
                                key={msg.id} 
                                isArchived={msg.archived}
                                isSentByMe={isSentByMe}
                                ref={isLastMessage ? messagesEndRef : null}
                            >
                                <div className="message-content">
                                    <strong>{msg.sender}</strong>
                                    {msg.type ? (
                                        <LazyMediaMessage message={msg} />
                                    ) : (
                                        <p>{msg.text}</p>
                                    )}
                                    <MessageTime isSentByMe={isSentByMe}>
                                        {msg.timestamp?.toDate().toLocaleTimeString()}
                                    </MessageTime>
                                </div>
                                <MessageActions isSentByMe={isSentByMe}>
                                    <ArchiveButton 
                                        onClick={() => toggleArchive(msg.id, msg.archived)}
                                        title={msg.archived ? "Unarchive message" : "Archive message"}
                                    >
                                        {msg.archived ? <Star /> : <StarBorder />}
                                    </ArchiveButton>
                                </MessageActions>
                            </MessageWrapper>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </MessagesContainer>
                <InputContainer>
                    <AttachmentBar>
                        <AttachmentButton 
                            onClick={() => imageInputRef.current.click()}
                            title="Send Image"
                        >
                            <Image />
                        </AttachmentButton>
                        <FileInput
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(e, 'image')}
                        />

                        <AttachmentButton
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            onMouseLeave={stopRecording}
                            title={isRecording ? "Recording..." : "Hold to Record"}
                        >
                            <Mic style={{ color: isRecording ? '#ff4444' : 'inherit' }} />
                        </AttachmentButton>
                        <FileInput
                            ref={audioInputRef}
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleFileSelect(e, 'audio')}
                        />

                        <AttachmentButton 
                            onClick={() => videoInputRef.current.click()}
                            title="Send Video"
                        >
                            <VideoCall />
                        </AttachmentButton>
                        <FileInput
                            ref={videoInputRef}
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleFileSelect(e, 'video')}
                        />
                    </AttachmentBar>
                    <form onSubmit={handleSubmit}>
                        <MessageInput
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Enter message..."
                        />
                        <SendButton type="submit">
                            SEND
                        </SendButton>
                    </form>
                </InputContainer>
            </ChatContainer>
        </>
    );
};

export default Chat;
