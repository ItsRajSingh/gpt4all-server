import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import styled from 'styled-components';
import { Delete, Folder, Code, Schedule, Add } from '@mui/icons-material';

const ProjectsContainer = styled.div`
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
`;

const ProjectGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
`;

const ProjectCard = styled.div`
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid var(--dedsec-green);
    border-radius: 10px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 255, 159, 0.2);
        
        .delete-button {
            opacity: 1;
        }
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, 
            transparent, 
            var(--dedsec-green), 
            transparent
        );
    }
`;

const ProjectTitle = styled.h3`
    color: var(--dedsec-green);
    font-size: 1.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ProjectDescription = styled.p`
    color: #fff;
    opacity: 0.8;
    margin-bottom: 1rem;
    line-height: 1.6;
`;

const ProjectMeta = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 255, 159, 0.2);
`;

const ProjectLanguage = styled.span`
    color: var(--dedsec-blue);
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ProjectDate = styled.span`
    color: var(--dedsec-green);
    opacity: 0.7;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const DeleteButton = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    color: #ff4444;
    cursor: pointer;
    opacity: 0;
    transition: all 0.3s ease;
    padding: 0.5rem;
    border-radius: 50%;

    &:hover {
        background: rgba(255, 68, 68, 0.1);
        transform: scale(1.1);
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem;
    color: var(--dedsec-green);
    opacity: 0.7;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
`;

const CreateButton = styled.button`
    background: var(--dedsec-green);
    color: black;
    border: none;
    padding: 1rem 2rem;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    margin-bottom: 2rem;

    &:hover {
        background: var(--dedsec-blue);
        transform: translateY(-2px);
    }
`;

const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
    overflow-y: auto;

    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
        display: none;
    }
    
    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none;
    scrollbar-width: none;
`;

const ModalContent = styled.div`
    background: #0a0a0a;
    padding: 3rem;
    border-radius: 10px;
    border: 1px solid var(--dedsec-green);
    width: 90%;
    max-width: 600px;
    position: relative;
    box-shadow: 0 0 20px rgba(0, 255, 159, 0.1);
    max-height: 90vh;
    overflow-y: auto;
    margin: auto;

    /* Customize scrollbar for the modal content */
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

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const FormTitle = styled.h2`
    color: var(--dedsec-green);
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
    position: relative;
    padding-bottom: 1.5rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    
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

const FormSubtitle = styled.p`
    color: rgba(0, 255, 159, 0.7);
    text-align: center;
    margin-bottom: 2rem;
    font-style: italic;
    line-height: 1.6;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    color: var(--dedsec-green);
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
`;

const Input = styled.input`
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--dedsec-green);
    padding: 1rem;
    color: white;
    border-radius: 5px;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: var(--dedsec-blue);
        box-shadow: 0 0 10px rgba(0, 255, 159, 0.2);
    }

    &::placeholder {
        color: rgba(255, 255, 255, 0.3);
    }
`;

const TextArea = styled.textarea`
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--dedsec-green);
    padding: 1rem;
    color: white;
    border-radius: 5px;
    font-size: 1rem;
    min-height: 100px;
    resize: vertical;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: var(--dedsec-blue);
        box-shadow: 0 0 10px rgba(0, 255, 159, 0.2);
    }

    &::placeholder {
        color: rgba(255, 255, 255, 0.3);
    }
`;

const Select = styled.select`
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--dedsec-green);
    padding: 1rem;
    color: white;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: var(--dedsec-blue);
        box-shadow: 0 0 10px rgba(0, 255, 159, 0.2);
    }

    option {
        background: #0a0a0a;
        color: white;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1rem;
`;

const Button = styled.button`
    padding: 0.8rem 1.5rem;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &.cancel {
        background: transparent;
        border: 1px solid var(--dedsec-green);
        color: var(--dedsec-green);
    }
    
    &.submit {
        background: var(--dedsec-green);
        border: none;
        color: black;
    }

    &:hover {
        transform: translateY(-2px);
    }
`;

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        objective: '',
        impact: '',
        timeline: '',
        status: 'Inception',
        resources: '',
        milestones: ''
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'projects'));
            const projectsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProjects(projectsData);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await deleteDoc(doc(db, 'projects', projectId));
                setProjects(projects.filter(project => project.id !== projectId));
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'No date';
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const docRef = await addDoc(collection(db, 'projects'), {
                ...newProject,
                createdAt: serverTimestamp()
            });
            
            const newProjectWithId = {
                id: docRef.id,
                ...newProject,
                createdAt: new Date()
            };
            
            setProjects([...projects, newProjectWithId]);
            setIsModalOpen(false);
            setNewProject({ title: '', description: '', objective: '', impact: '', timeline: '', status: 'Inception', resources: '', milestones: '' });
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    if (loading) {
        return <EmptyState>Loading projects...</EmptyState>;
    }

    return (
        <ProjectsContainer>
            <CreateButton onClick={() => setIsModalOpen(true)}>
                <Add /> Create New Project
            </CreateButton>

            {projects.length === 0 ? (
                <EmptyState>
                    <div>No projects found.</div>
                </EmptyState>
            ) : (
                <ProjectGrid>
                    {projects.map(project => (
                        <ProjectCard key={project.id}>
                            <DeleteButton 
                                className="delete-button"
                                onClick={() => handleDelete(project.id)}
                            >
                                <Delete />
                            </DeleteButton>
                            <ProjectTitle>
                                <Folder /> {project.title}
                            </ProjectTitle>
                            <ProjectDescription>{project.description}</ProjectDescription>
                            <ProjectMeta>
                                <div style={{ color: 'var(--dedsec-blue)' }}>
                                    Status: {project.status || 'Planning'}
                                </div>
                                <ProjectDate>
                                    <Schedule /> {formatDate(project.createdAt)}
                                </ProjectDate>
                            </ProjectMeta>
                        </ProjectCard>
                    ))}
                </ProjectGrid>
            )}

            {isModalOpen && (
                <Modal>
                    <ModalContent>
                        <Form onSubmit={handleCreateProject}>
                            <FormTitle>Forge Your Vision</FormTitle>
                            <FormSubtitle>
                                Every revolutionary project begins with a spark of imagination. 
                                Define your vision and set it in motion.
                            </FormSubtitle>
                            
                            <FormGroup>
                                <Label>Project Codename</Label>
                                <Input
                                    type="text"
                                    placeholder="Give your vision a powerful identifier"
                                    value={newProject.title}
                                    onChange={(e) => setNewProject({
                                        ...newProject,
                                        title: e.target.value
                                    })}
                                    required
                                />
                            </FormGroup>
                            
                            <FormGroup>
                                <Label>Vision Statement</Label>
                                <TextArea
                                    placeholder="Paint the grand picture of your project's essence and purpose"
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({
                                        ...newProject,
                                        description: e.target.value
                                    })}
                                    required
                                />
                            </FormGroup>
                            
                            <FormGroup>
                                <Label>Core Objectives</Label>
                                <TextArea
                                    placeholder="What paradigm shifts and transformations will your project catalyze?"
                                    value={newProject.objective}
                                    onChange={(e) => setNewProject({
                                        ...newProject,
                                        objective: e.target.value
                                    })}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Revolutionary Impact</Label>
                                <TextArea
                                    placeholder="How will your project reshape reality and inspire change in the world?"
                                    value={newProject.impact}
                                    onChange={(e) => setNewProject({
                                        ...newProject,
                                        impact: e.target.value
                                    })}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Strategic Timeline</Label>
                                <Input
                                    type="text"
                                    placeholder="When will your vision materialize into reality?"
                                    value={newProject.timeline}
                                    onChange={(e) => setNewProject({
                                        ...newProject,
                                        timeline: e.target.value
                                    })}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Project Phase</Label>
                                <Select
                                    value={newProject.status}
                                    onChange={(e) => setNewProject({
                                        ...newProject,
                                        status: e.target.value
                                    })}
                                >
                                    <option value="Inception">Inception</option>
                                    <option value="Manifestation">Manifestation</option>
                                    <option value="Evolution">Evolution</option>
                                    <option value="Ascension">Ascension</option>
                                    <option value="Transcendence">Transcendence</option>
                                </Select>
                            </FormGroup>

                            <FormGroup>
                                <Label>Resource Requirements</Label>
                                <TextArea
                                    placeholder="What elements and resources will fuel your vision's manifestation?"
                                    value={newProject.resources}
                                    onChange={(e) => setNewProject({
                                        ...newProject,
                                        resources: e.target.value
                                    })}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Quantum Milestones</Label>
                                <TextArea
                                    placeholder="Define the key breakthrough moments that will mark your project's evolution"
                                    value={newProject.milestones}
                                    onChange={(e) => setNewProject({
                                        ...newProject,
                                        milestones: e.target.value
                                    })}
                                    required
                                />
                            </FormGroup>
                            
                            <ButtonGroup>
                                <Button 
                                    type="button" 
                                    className="cancel"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Dissolve
                                </Button>
                                <Button type="submit" className="submit">
                                    Manifest Vision
                                </Button>
                            </ButtonGroup>
                        </Form>
                    </ModalContent>
                </Modal>
            )}
        </ProjectsContainer>
    );
};

export default Projects; 