import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import styled from 'styled-components';
import { Edit, Save } from '@mui/icons-material';

const ProfileContainer = styled.div`
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
    color: var(--dedsec-green);
    height: calc(100vh - 80px);
    overflow-y: auto;
    
    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: var(--dedsec-green);
        border-radius: 4px;
        
        &:hover {
            background: var(--dedsec-blue);
        }
    }
`;

const ProfileCard = styled.div`
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid var(--dedsec-green);
    border-radius: 10px;
    padding: 3rem;
    margin: 2rem auto;
    box-shadow: 0 0 20px rgba(0, 255, 159, 0.1);
    max-width: 700px;
`;

const Title = styled.h2`
    color: var(--dedsec-green);
    font-size: 2.2rem;
    margin-bottom: 2.5rem;
    text-align: center;
    position: relative;
    padding-bottom: 1.5rem;
    letter-spacing: 2px;
    
    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 150px;
        height: 2px;
        background: linear-gradient(90deg, 
            transparent, 
            var(--dedsec-green), 
            var(--dedsec-blue),
            var(--dedsec-green), 
            transparent
        );
    }
`;

const FormGroup = styled.div`
    margin-bottom: 2rem;
    position: relative;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 0.8rem;
    color: var(--dedsec-green);
    font-size: 1.1rem;
    letter-spacing: 1px;
`;

const Input = styled.input`
    width: 100%;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--dedsec-green);
    border-radius: 5px;
    color: white;
    font-size: 1rem;
    transition: all 0.3s ease;
    letter-spacing: 0.5px;

    &:focus {
        outline: none;
        border-color: var(--dedsec-blue);
        box-shadow: 0 0 15px rgba(0, 255, 159, 0.2);
    }

    &::placeholder {
        color: rgba(255, 255, 255, 0.3);
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--dedsec-green);
    border-radius: 5px;
    color: white;
    font-size: 1rem;
    min-height: 120px;
    resize: vertical;
    transition: all 0.3s ease;
    letter-spacing: 0.5px;
    line-height: 1.6;

    &:focus {
        outline: none;
        border-color: var(--dedsec-blue);
        box-shadow: 0 0 15px rgba(0, 255, 159, 0.2);
    }

    &::placeholder {
        color: rgba(255, 255, 255, 0.3);
    }
`;

const Button = styled.button`
    background: var(--dedsec-green);
    color: black;
    border: none;
    padding: 1rem 2rem;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    transition: all 0.3s ease;
    margin: 3rem 0 1rem auto;
    font-size: 1.1rem;
    letter-spacing: 1px;

    &:hover {
        background: var(--dedsec-blue);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 255, 159, 0.2);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const StatusMessage = styled.div`
    text-align: center;
    margin-top: 1.5rem;
    padding: 1rem;
    border-radius: 5px;
    color: ${props => props.error ? '#ff4444' : 'var(--dedsec-green)'};
    background: ${props => props.error ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0, 255, 159, 0.1)'};
    letter-spacing: 0.5px;
`;

const ProfileSettings = () => {
    const [profile, setProfile] = useState({
        displayName: '',
        bio: '',
        location: '',
        expertise: '',
        interests: '',
        goals: '',
        contact: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const userId = auth.currentUser.uid;
            const userDoc = await getDoc(doc(db, 'users', userId));
            
            if (userDoc.exists()) {
                setProfile(userDoc.data());
            } else {
                // Create initial profile document if it doesn't exist
                const initialProfile = {
                    displayName: '',
                    bio: '',
                    location: '',
                    expertise: '',
                    interests: '',
                    goals: '',
                    contact: '',
                    email: auth.currentUser.email
                };
                await setDoc(doc(db, 'users', userId), initialProfile);
                setProfile(initialProfile);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setStatus('Error loading profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatus('');

        try {
            const userId = auth.currentUser.uid;
            const userRef = doc(db, 'users', userId);
            
            // Use setDoc with merge option to create or update
            await setDoc(userRef, {
                ...profile,
                updatedAt: new Date(),
                email: auth.currentUser.email
            }, { merge: true });
            
            setStatus('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            setStatus('Error updating profile: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return <ProfileContainer>Loading profile...</ProfileContainer>;
    }

    return (
        <ProfileContainer>
            <Title>Personal Node Configuration</Title>
            <ProfileCard>
                <form onSubmit={handleSubmit}>
                    <FormGroup>
                        <Label>Display Name</Label>
                        <Input
                            type="text"
                            name="displayName"
                            value={profile.displayName}
                            onChange={handleChange}
                            placeholder="Enter your display name"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Bio</Label>
                        <TextArea
                            name="bio"
                            value={profile.bio}
                            onChange={handleChange}
                            placeholder="Tell us about yourself"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Location</Label>
                        <Input
                            type="text"
                            name="location"
                            value={profile.location}
                            onChange={handleChange}
                            placeholder="Your location"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Areas of Expertise</Label>
                        <TextArea
                            name="expertise"
                            value={profile.expertise}
                            onChange={handleChange}
                            placeholder="What are your areas of expertise?"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Interests</Label>
                        <TextArea
                            name="interests"
                            value={profile.interests}
                            onChange={handleChange}
                            placeholder="What interests you?"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Goals</Label>
                        <TextArea
                            name="goals"
                            value={profile.goals}
                            onChange={handleChange}
                            placeholder="What are your goals?"
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label>Contact Information</Label>
                        <Input
                            type="text"
                            name="contact"
                            value={profile.contact}
                            onChange={handleChange}
                            placeholder="How can others reach you?"
                        />
                    </FormGroup>

                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Profile'} {!saving && <Save />}
                    </Button>

                    {status && <StatusMessage error={status.includes('Error')}>{status}</StatusMessage>}
                </form>
            </ProfileCard>
        </ProfileContainer>
    );
};

export default ProfileSettings; 