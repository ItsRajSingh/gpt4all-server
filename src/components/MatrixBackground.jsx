import React, { useEffect, useRef, memo } from 'react';
import styled from 'styled-components';

const Canvas = styled.canvas`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: calc(100vh - 80px);
    z-index: 0;
    background: #000000;
    pointer-events: none;
`;

const MatrixBackground = memo(() => {
    const canvasRef = useRef(null);
    const frameRef = useRef(null);
    const timeRef = useRef(0);
    const singularityRef = useRef({
        radius: 30,
        intensity: 0,
        distortion: 0,
        eventHorizon: 0,
        insideHole: false,
        transitionFlash: 0,
        ringExpansion: 0,
        phase: 'growing',
        transformationProgress: 0,
        emissionIntensity: 0,
        collapseProgress: 0,
        phaseStartTime: 0,
        cycleCount: 0,
        resetFlash: 0
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const setCanvasDimensions = () => {
            const scale = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * scale;
            canvas.height = (window.innerHeight - 80) * scale;
            ctx.scale(scale, scale);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight - 80}px`;
        };
        setCanvasDimensions();

        class BlackHole {
            constructor() {
                this.stars = Array(2000).fill().map(() => ({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 1,
                    speed: Math.random() * 2 + 1,
                    angle: Math.random() * Math.PI * 2,
                    distance: Math.random() * canvas.width
                }));
            }

            update(singularity) {
                const centerX = (canvas.width * 0.5) - 400;
                const centerY = (canvas.height * 0.5) - 120;

                this.stars.forEach(star => {
                    const dx = star.x - centerX;
                    const dy = star.y - centerY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const pull = (singularity.radius * singularity.intensity) / (distance * 1.5);
                    const angle = Math.atan2(dy, dx);

                    star.angle += 0.01 * pull;
                    star.distance -= pull * star.speed * 0.5;

                    if (distance < singularity.radius || star.distance < 0) {
                        star.distance = Math.max(canvas.width, canvas.height);
                        star.angle = Math.random() * Math.PI * 2;
                    }

                    star.x = centerX + Math.cos(star.angle) * star.distance;
                    star.y = centerY + Math.sin(star.angle) * star.distance;
                });
            }

            draw(ctx, singularity) {
                const centerX = (canvas.width * 0.5) - 400;
                const centerY = (canvas.height * 0.5) - 120;

                const gradient = ctx.createRadialGradient(
                    centerX, centerY, 0,
                    centerX, centerY, singularity.radius * 2
                );
                gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
                gradient.addColorStop(0.5, 'rgba(0, 40, 80, 0.3)');
                gradient.addColorStop(1, 'transparent');

                ctx.beginPath();
                ctx.fillStyle = gradient;
                ctx.arc(centerX, centerY, singularity.radius * 2, 0, Math.PI * 2);
                ctx.fill();

                this.stars.forEach(star => {
                    const dx = star.x - centerX;
                    const dy = star.y - centerY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    const distortion = Math.max(1, (singularity.radius * 3) / distance);
                    const angle = Math.atan2(dy, dx);
                    
                    const distortedX = centerX + dx * (1 + distortion * singularity.distortion);
                    const distortedY = centerY + dy * (1 + distortion * singularity.distortion);

                    const stretch = Math.min(50, distortion * star.size * singularity.intensity);
                    
                    ctx.beginPath();
                    const starGradient = ctx.createLinearGradient(
                        distortedX - Math.cos(angle) * stretch,
                        distortedY - Math.sin(angle) * stretch,
                        distortedX + Math.cos(angle) * stretch,
                        distortedY + Math.sin(angle) * stretch
                    );
                    
                    const alpha = Math.max(0, 1 - (distance / singularity.radius) * 0.1);
                    starGradient.addColorStop(0, 'transparent');
                    starGradient.addColorStop(0.5, `rgba(0, 255, 255, ${alpha})`);
                    starGradient.addColorStop(1, 'transparent');

                    ctx.strokeStyle = starGradient;
                    ctx.lineWidth = star.size;
                    ctx.moveTo(
                        distortedX - Math.cos(angle) * stretch,
                        distortedY - Math.sin(angle) * stretch
                    );
                    ctx.lineTo(
                        distortedX + Math.cos(angle) * stretch,
                        distortedY + Math.sin(angle) * stretch
                    );
                    ctx.stroke();
                });
            }
        }

        class DimensionalPattern {
            constructor() {
                this.reset();
            }

            reset() {
                this.rings = Array(12).fill().map((_, i) => ({
                    radius: 0,
                    rotation: (i % 2 ? 1 : -1) * Math.PI / 6,
                    speed: (i % 2 ? 0.002 : -0.002) * (1 + i * 0.1),
                    width: 3,
                    points: 8 + i,
                    offset: i * Math.PI / 8,
                    baseHue: 180 + (i * 15) % 180
                }));
                this.particles = [];
            }

            createParticle(x, y, angle) {
                return {
                    x,
                    y,
                    angle: angle + (Math.random() - 0.5) * 0.5,
                    speed: 2 + Math.random() * 3,
                    life: 1,
                    size: 2 + Math.random() * 3,
                    maxDistance: Math.max(canvas.width, canvas.height),
                    originX: x,
                    originY: y
                };
            }

            update(singularity, time) {
                const centerX = (canvas.width * 0.5) - 400;
                const centerY = (canvas.height * 0.5) - 120;

                if (time - singularity.phaseStartTime > 8000) {
                    singularity.transformationProgress = Math.min(1, singularity.transformationProgress + 0.0005);
                    singularity.emissionIntensity = Math.min(1, singularity.emissionIntensity + 0.001);
                }

                if (singularity.transformationProgress >= 1) {
                    singularity.collapseProgress = Math.min(1, singularity.collapseProgress + 0.002);
                    
                    if (singularity.collapseProgress >= 1) {
                        singularity.resetFlash = 1;
                        singularity.insideHole = false;
                        singularity.radius = 30;
                        singularity.intensity = 0;
                        singularity.distortion = 0;
                        singularity.transitionFlash = 0;
                        singularity.ringExpansion = 0;
                        singularity.transformationProgress = 0;
                        singularity.emissionIntensity = 0;
                        singularity.collapseProgress = 0;
                        singularity.cycleCount++;
                        this.reset();
                    }
                }

                this.rings.forEach((ring, i) => {
                    const ringDelay = i * 0.1;
                    const ringExpansion = Math.max(0, singularity.ringExpansion - ringDelay);
                    
                    const collapseScale = 1 - (singularity.collapseProgress * 0.8);
                    let targetRadius;
                    
                    if (singularity.collapseProgress > 0) {
                        targetRadius = (50 + i * 30 + singularity.collapseProgress * 200) * collapseScale;
                    } else {
                        targetRadius = (50 + i * 30) * Math.min(1, ringExpansion);
                    }
                    
                    ring.radius += (targetRadius - ring.radius) * 0.1;
                    ring.rotation += ring.speed * (1 + singularity.transformationProgress);
                });

                if (singularity.emissionIntensity > 0) {
                    const emissionRate = 0.3 * (1 + singularity.transformationProgress);
                    if (Math.random() < emissionRate) {
                        const angle = Math.random() * Math.PI * 2;
                        const radius = this.rings[0].radius * (1 + singularity.collapseProgress);
                        this.particles.push(this.createParticle(
                            centerX + Math.cos(angle) * radius,
                            centerY + Math.sin(angle) * radius,
                            angle
                        ));
                    }
                }

                this.particles = this.particles.filter(particle => {
                    const speedMultiplier = 1 + singularity.collapseProgress * 2;
                    particle.x += Math.cos(particle.angle) * particle.speed * speedMultiplier;
                    particle.y += Math.sin(particle.angle) * particle.speed * speedMultiplier;
                    
                    const dx = particle.x - particle.originX;
                    const dy = particle.y - particle.originY;
                    const distanceTraveled = Math.sqrt(dx * dx + dy * dy);
                    
                    particle.life = Math.max(0, 1 - (distanceTraveled / (particle.maxDistance * (1 + singularity.collapseProgress))));
                    
                    return particle.life > 0;
                });
            }

            draw(ctx, singularity, time) {
                const centerX = (canvas.width * 0.5) - 400;
                const centerY = (canvas.height * 0.5) - 120;

                if (singularity.resetFlash > 0) {
                    const gradient = ctx.createRadialGradient(
                        centerX, centerY, 0,
                        centerX, centerY, canvas.width
                    );
                    gradient.addColorStop(0, `rgba(255, 200, 150, ${singularity.resetFlash * 0.4})`);
                    gradient.addColorStop(0.5, `rgba(255, 100, 50, ${singularity.resetFlash * 0.2})`);
                    gradient.addColorStop(1, 'transparent');
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                if (singularity.collapseProgress > 0) {
                    const radius = 200 * (1 + singularity.collapseProgress * 3);
                    const gradient = ctx.createRadialGradient(
                        centerX, centerY, 0,
                        centerX, centerY, radius
                    );
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
                    gradient.addColorStop(0.5, `rgba(${255 * singularity.collapseProgress}, 0, 0, 0.3)`);
                    gradient.addColorStop(1, 'transparent');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    ctx.fill();
                }

                this.particles.forEach(particle => {
                    const gradient = ctx.createRadialGradient(
                        particle.x, particle.y, 0,
                        particle.x, particle.y, particle.size * 2
                    );
                    
                    const hue = 180 * (1 - singularity.transformationProgress) + 
                              0 * singularity.transformationProgress;
                              
                    gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${particle.life})`);
                    gradient.addColorStop(1, 'transparent');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size * (1 + (1 - particle.life)), 0, Math.PI * 2);
                    ctx.fill();
                });

                this.drawEyePattern(ctx, centerX, centerY, singularity);

                if (singularity.collapseProgress > 0) {
                    const collapseGradient = ctx.createRadialGradient(
                        centerX, centerY, 0,
                        centerX, centerY, 200 * (1 - singularity.collapseProgress)
                    );
                    collapseGradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
                    collapseGradient.addColorStop(1, 'transparent');
                    ctx.fillStyle = collapseGradient;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            drawEyePattern(ctx, x, y, singularity) {
                this.rings.forEach((ring, ringIndex) => {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(ring.rotation);

                    for (let orbit = 0; orbit < ring.points; orbit++) {
                        const angle = (orbit / ring.points) * Math.PI * 2 + ring.offset;
                        const orbitX = Math.cos(angle) * ring.radius * 0.2;
                        const orbitY = Math.sin(angle) * ring.radius * 0.2;

                        ctx.beginPath();
                        for (let i = 0; i <= 30; i++) {
                            const pathAngle = (i / 30) * Math.PI * 2;
                            const pathX = orbitX + Math.cos(pathAngle) * ring.radius;
                            const pathY = orbitY + Math.sin(pathAngle) * ring.radius;
                            
                            if (i === 0) ctx.moveTo(pathX, pathY);
                            else ctx.lineTo(pathX, pathY);
                        }

                        const hue = ring.baseHue * (1 - singularity.transformationProgress) + 
                                  0 * singularity.transformationProgress;
                        
                        const gradient = ctx.createLinearGradient(
                            -ring.radius, 0, ring.radius, 0
                        );
                        
                        const alpha = Math.min(1, singularity.ringExpansion * 2 - ringIndex * 0.1);
                        gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0)`);
                        gradient.addColorStop(0.5, `hsla(${hue}, 100%, 70%, ${alpha * 0.5})`);
                        gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);

                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = ring.width;
                        ctx.stroke();

                        const particleAngle = timeRef.current * 0.001 * (ringIndex + 1) + orbit * (Math.PI * 2 / ring.points);
                        const particleX = orbitX + Math.cos(particleAngle) * ring.radius;
                        const particleY = orbitY + Math.sin(particleAngle) * ring.radius;

                        const particleGradient = ctx.createRadialGradient(
                            particleX, particleY, 0,
                            particleX, particleY, 10
                        );
                        particleGradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${alpha})`);
                        particleGradient.addColorStop(1, 'transparent');

                        ctx.fillStyle = particleGradient;
                        ctx.beginPath();
                        ctx.arc(particleX, particleY, 5, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    ctx.restore();
                });
            }
        }

        const blackHole = new BlackHole();
        const dimensionalPattern = new DimensionalPattern();

        const animate = (timestamp) => {
            timeRef.current = timestamp;

            if (!singularityRef.current.insideHole) {
                if (singularityRef.current.resetFlash > 0) {
                    singularityRef.current.resetFlash *= 0.95;
                }

                singularityRef.current.radius += 0.2;
                singularityRef.current.intensity = Math.min(1, singularityRef.current.intensity + 0.0005);
                singularityRef.current.distortion = Math.min(1, singularityRef.current.distortion + 0.0002);

                if (singularityRef.current.radius > canvas.width / 4) {
                    singularityRef.current.insideHole = true;
                    singularityRef.current.transitionFlash = 1;
                    singularityRef.current.phaseStartTime = timestamp;
                    dimensionalPattern.reset();
                }
            } else {
                singularityRef.current.transitionFlash *= 0.97;
                singularityRef.current.ringExpansion = Math.min(1, singularityRef.current.ringExpansion + 0.01);
            }

            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (!singularityRef.current.insideHole) {
                blackHole.update(singularityRef.current);
                blackHole.draw(ctx, singularityRef.current);
            } else {
                dimensionalPattern.update(singularityRef.current, timestamp);
                dimensionalPattern.draw(ctx, singularityRef.current, timestamp);
            }

            frameRef.current = requestAnimationFrame(animate);
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, []);

    return <Canvas ref={canvasRef} />;
});

MatrixBackground.displayName = 'MatrixBackground';

export default MatrixBackground;