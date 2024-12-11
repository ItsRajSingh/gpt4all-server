export function createMatrixBackground() {
    const container = document.createElement('div');
    container.className = 'matrix-background';
    document.body.appendChild(container);

    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ';
    const columnCount = Math.floor(window.innerWidth / 20);

    for (let i = 0; i < columnCount; i++) {
        const column = document.createElement('div');
        column.className = 'matrix-column';
        column.style.left = (i * 20) + 'px';
        column.style.animationDuration = (Math.random() * 3 + 2) + 's';
        column.style.opacity = Math.random() * 0.5 + 0.5;

        let columnText = '';
        for (let j = 0; j < 50; j++) {
            columnText += characters[Math.floor(Math.random() * characters.length)] + '<br>';
        }
        column.innerHTML = columnText;

        container.appendChild(column);
    }

    return container;
}

export function initMatrixBackground() {
    let matrixContainer = createMatrixBackground();

    // Periodically update characters
    const updateInterval = setInterval(() => {
        if (!document.body.contains(matrixContainer)) {
            clearInterval(updateInterval);
            return;
        }

        document.querySelectorAll('.matrix-column').forEach(column => {
            let columnText = '';
            for (let j = 0; j < 50; j++) {
                columnText += characters[Math.floor(Math.random() * characters.length)] + '<br>';
            }
            column.innerHTML = columnText;
        });
    }, 5000);

    // Update on window resize
    window.addEventListener('resize', () => {
        if (matrixContainer) {
            matrixContainer.remove();
        }
        matrixContainer = createMatrixBackground();
    });
} 