import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import styled from 'styled-components';

const ProfileContainer = styled.div`
  padding: 30px;
  color: var(--dedsec-blue);
`;

const ProfileForm = styled.form`
  max-width: 600px;
  background: rgba(0, 0, 0, 0.6);
  padding: 30px;
  border: 1px solid var(--dedsec-blue);
  backdrop-filter: blur(5px);
`;

const Title = styled.h2`
  color: var(--dedsec-green);
  margin-bottom: 30px;
  font-family: 'Share Tech Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Field = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: var(--dedsec-green);
  font-family: 'Share Tech Mono', monospace;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--dedsec-blue);
  color: var(--dedsec-blue);
  font-family: 'Share Tech Mono', monospace;

  &:focus {
    outline: none;
    border-color: var(--dedsec-green);
    box-shadow: 0 0 10px rgba(0, 229, 255, 0.3);
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--dedsec-blue);
  color: var(--dedsec-blue);
  font-family: 'Share Tech Mono', monospace;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 229, 255, 0.1);
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.3);
  }
`;

const StatusMessage = styled.div`
  margin-top: 20px;
  color: ${props => props.error ? 'var(--error-red)' : 'var(--dedsec-green)'};
`;

const Profile = () => {
  const [profile, setProfile] = useState({
    displayName: '',
    bio: '',
    location: '',
    expertise: ''
  });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (err) {
        setError('Error fetching profile data');
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setError('');

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, profile);
      setStatus('Profile updated successfully');
    } catch (err) {
      setError('Error updating profile');
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  return (
    <ProfileContainer>
      <ProfileForm onSubmit={handleSubmit}>
        <Title>Personal Node Configuration</Title>
        
        <Field>
          <Label>NODE IDENTIFIER</Label>
          <Input
            type="text"
            name="displayName"
            value={profile.displayName}
            onChange={handleChange}
            placeholder="Enter display name"
          />
        </Field>

        <Field>
          <Label>NODE DESCRIPTION</Label>
          <Input
            type="text"
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            placeholder="Enter bio"
          />
        </Field>

        <Field>
          <Label>NODE LOCATION</Label>
          <Input
            type="text"
            name="location"
            value={profile.location}
            onChange={handleChange}
            placeholder="Enter location"
          />
        </Field>

        <Field>
          <Label>NODE EXPERTISE</Label>
          <Input
            type="text"
            name="expertise"
            value={profile.expertise}
            onChange={handleChange}
            placeholder="Enter expertise"
          />
        </Field>

        <Button type="submit">UPDATE CONFIGURATION</Button>
        
        {status && <StatusMessage>{status}</StatusMessage>}
        {error && <StatusMessage error>{error}</StatusMessage>}
      </ProfileForm>
    </ProfileContainer>
  );
};

export default Profile; 