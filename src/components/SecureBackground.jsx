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

const SecureBackground = memo(() => {
    const canvasRef = useRef(null);
    const frameRef = useRef(null);
    const timeRef = useRef(0);

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

        class EncryptedPattern {
            constructor() {
                this.particles = Array(100).fill().map(() => ({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 3 + 1,
                    speedX: (Math.random() - 0.5) * 2,
                    speedY: (Math.random() - 0.5) * 2,
                    connections: [],
                    hue: Math.random() * 60 + 120, // Cyan to green range
                }));
                
                this.symbols = "01".split("");
                this.symbolsGrid = [];
                this.initSymbolsGrid();
            }

            initSymbolsGrid() {
                const gridSize = 30;
                for(let x = 0; x < canvas.width; x += gridSize) {
                    for(let y = 0; y < canvas.height; y += gridSize) {
                        if(Math.random() < 0.3) {
                            this.symbolsGrid.push({
                                x,
                                y,
                                symbol: this.symbols[Math.floor(Math.random() * this.symbols.length)],
                                alpha: Math.random(),
                                size: Math.random() * 12 + 8
                            });
                        }
                    }
                }
            }

            update(time) {
                // Update particles
                this.particles.forEach(particle => {
                    particle.x += particle.speedX;
                    particle.y += particle.speedY;
                    
                    // Wrap around screen
                    if(particle.x < 0) particle.x = canvas.width;
                    if(particle.x > canvas.width) particle.x = 0;
                    if(particle.y < 0) particle.y = canvas.height;
                    if(particle.y > canvas.height) particle.y = 0;

                    // Update connections
                    particle.connections = [];
                    this.particles.forEach(other => {
                        const dx = other.x - particle.x;
                        const dy = other.y - particle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if(distance < 150 && distance > 0) {
                            particle.connections.push({
                                point: other,
                                alpha: 1 - (distance / 150)
                            });
                        }
                    });
                });

                // Update symbols
                this.symbolsGrid.forEach(symbol => {
                    symbol.alpha += (Math.random() - 0.5) * 0.1;
                    symbol.alpha = Math.max(0.1, Math.min(0.9, symbol.alpha));
                    if(Math.random() < 0.05) {
                        symbol.symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                    }
                });
            }

            draw(ctx, time) {
                // Draw connections
                this.particles.forEach(particle => {
                    particle.connections.forEach(connection => {
                        const gradient = ctx.createLinearGradient(
                            particle.x, particle.y,
                            connection.point.x, connection.point.y
                        );
                        
                        gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 50%, ${connection.alpha * 0.5})`);
                        gradient.addColorStop(1, `hsla(${connection.point.hue}, 100%, 50%, ${connection.alpha * 0.5})`);

                        ctx.beginPath();
                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(connection.point.x, connection.point.y);
                        ctx.stroke();
                    });
                });

                // Draw particles
                this.particles.forEach(particle => {
                    ctx.beginPath();
                    const gradient = ctx.createRadialGradient(
                        particle.x, particle.y, 0,
                        particle.x, particle.y, particle.size * 2
                    );
                    gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 50%, 0.8)`);
                    gradient.addColorStop(1, 'transparent');
                    
                    ctx.fillStyle = gradient;
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                });

                // Draw symbols
                ctx.font = '12px monospace';
                this.symbolsGrid.forEach(symbol => {
                    ctx.fillStyle = `rgba(0, 255, 150, ${symbol.alpha * 0.3})`;
                    ctx.fillText(symbol.symbol, symbol.x, symbol.y);
                });
            }
        }

        const encryptedPattern = new EncryptedPattern();

        const animate = (timestamp) => {
            timeRef.current = timestamp;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            encryptedPattern.update(timestamp);
            encryptedPattern.draw(ctx, timestamp);

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

SecureBackground.displayName = 'SecureBackground';

export default SecureBackground; 