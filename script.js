
// ==========================================
// НАЛАШТУВАННЯ САЙТУ
// ==========================================

let finalStarted = false;
let floatingHeartTimer = null;


// ==========================================
// ПЕРЕХІД МІЖ ЕКРАНАМИ
// ==========================================

function nextScreen(number) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const next = document.getElementById(`screen${number}`);

    if (next) {
        next.classList.add('active');
    }
}


// ==========================================
// ФОНОВІ СЕРДЕЧКА
// ==========================================

function createFloatingHeart() {
    const background = document.getElementById('heartsBackground');

    if (!background) return;

    const heart = document.createElement('span');

    const symbols = ['♥', '♡', '❤', '💕'];
    const colors = [
        '#ff4d79',
        '#ff85a1',
        '#ffb6c8',
        '#d85b8b',
        '#ffffff',
        '#c77dff'
    ];

    heart.className = 'floating-heart';
    heart.textContent =
        symbols[Math.floor(Math.random() * symbols.length)];

    heart.style.position = 'absolute';
    heart.style.left = Math.random() * 100 + '%';
    heart.style.bottom = '-30px';
    heart.style.color =
        colors[Math.floor(Math.random() * colors.length)];

    heart.style.fontSize = (12 + Math.random() * 22) + 'px';
    heart.style.opacity = 0.4 + Math.random() * 0.5;
    heart.style.pointerEvents = 'none';
    heart.style.animation = 'floatUp 6s linear forwards';

    background.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 6500);
}


// ==========================================
// ЗАПУСК ФОНОВОЇ АНІМАЦІЇ
// ==========================================

function startFloatingHearts() {
    if (floatingHeartTimer) return;

    floatingHeartTimer = setInterval(createFloatingHeart, 450);
}


// ==========================================
// ФІНАЛЬНИЙ ЕКРАН
// ==========================================

function showFinal() {
    if (finalStarted) return;

    finalStarted = true;

    nextScreen(5);

    setTimeout(() => {
        createHeartPortrait();
    }, 1000);
}


// ==========================================
// СТВОРЕННЯ ПОРТРЕТА З СЕРДЕЧОК
// ==========================================


function createHeartPortrait() {
    const canvas = document.getElementById('heartCanvas');
    const countElement = document.getElementById('heartCount');

    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
        alpha: true
    });

    canvas.width = 650;
    canvas.height = 440;

    if (countElement) {
        countElement.textContent =
            'Тисячі сердечок збирають твій портрет... ❤️';
    }

    const image = new Image();

    image.onload = function () {
        const offscreen = document.createElement('canvas');
        const offCtx = offscreen.getContext('2d', {
            willReadFrequently: true
        });

        offscreen.width = 650;
        offscreen.height = 440;

        const scale = Math.min(
    430 / image.width,
    430 / image.height
);

        const width = image.width * scale;
        const height = image.height * scale;

        const imageX = (650 - width) / 2;
        const imageY = (440 - height) / 2;

        offCtx.drawImage(
            image,
            imageX,
            imageY,
            width,
            height
        );

        const pixels = offCtx.getImageData(
            0, 0, 650, 440
        ).data;

        const particles = [];
        const step = 1.4;

        // Збираємо кольори фотографії
        for (let y = 0; y < 440; y += step) {
            for (let x = 0; x < 650; x += step) {
                const index =
                    (Math.floor(y) * 650 + Math.floor(x)) * 4;

                if (pixels[index + 3] < 100) continue;

                // Трохи підсилюємо яскравість і насиченість
                let r = pixels[index];
                let g = pixels[index + 1];
                let b = pixels[index + 2];

                const brightness = 1.08;
                const saturation = 1.16;

                const gray = 0.299 * r + 0.587 * g + 0.114 * b;

                r = Math.min(255, Math.round(
                    (gray + (r - gray) * saturation) * brightness
                ));

                g = Math.min(255, Math.round(
                    (gray + (g - gray) * saturation) * brightness
                ));

                b = Math.min(255, Math.round(
                    (gray + (b - gray) * saturation) * brightness
                ));

                const angle = Math.random() * Math.PI * 2;

                particles.push({
                    x: x,
                    y: y,
                    color: `rgb(${r},${g},${b})`,
                    angle: angle,
                    distance: 250 + Math.random() * 350,
                    delay: Math.random() * 1800
                });
            }
        }

        // Створюємо окремий шар для готового портрета
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = 650;
        finalCanvas.height = 440;

        const finalCtx = finalCanvas.getContext('2d');

        // Малюємо фінальний портрет один раз
        for (const p of particles) {
            finalCtx.font = 'bold 2.2px Arial';
            finalCtx.textAlign = 'center';
            finalCtx.textBaseline = 'middle';
            finalCtx.fillStyle = p.color;
            finalCtx.fillText('♥', p.x, p.y);
        }

        // Для плавной анимации используем меньше объектов
        const animated = [];
        const animatedCount = Math.min(8000, particles.length);
        const interval = particles.length / animatedCount;

        for (let i = 0; i < animatedCount; i++) {
            const p = particles[Math.floor(i * interval)];

            animated.push({
                ...p,
                startX: 325 + Math.cos(p.angle) * p.distance,
                startY: 220 + Math.sin(p.angle) * p.distance
            });
        }

        let startTime = null;

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;

            const elapsed = timestamp - startTime;

            ctx.clearRect(0, 0, 650, 440);

            let unfinished = false;

ctx.font = 'bold 3px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle'; 

            for (const p of animated) {
                const time = Math.max(0, elapsed - p.delay);
                const progress = Math.min(time / 5500, 1);

                if (progress < 1) unfinished = true;

                // М'яке плавне наближення
                const eased = progress * progress * (3 - 2 * progress);

                const spiral = (1 - eased) * Math.PI * 2;

                const angle = p.angle + spiral;
                const distance = p.distance * (1 - eased);

                const spiralX =
                    p.x + Math.cos(angle) * distance;

                const spiralY =
                    p.y + Math.sin(angle) * distance;

                const currentX =
                    p.startX + (spiralX - p.startX) * eased;

                const currentY =
                    p.startY + (spiralY - p.startY) * eased;

                ctx.fillStyle = p.color;
ctx.fillText('♥', currentX, currentY);

                ctx.fillText('♥', currentX, currentY);
            }

            if (unfinished) {
                requestAnimationFrame(animate);
            } else {
                // Готовий портрет з усіх сердечок
                ctx.clearRect(0, 0, 650, 440);
                ctx.drawImage(finalCanvas, 0, 0);

                if (countElement) {
                    countElement.textContent =
                        `Для створення одного мого сердця знадобилося ${particles.length.toLocaleString('uk-UA')} сердечок ❤️`;
                }
            }
        }

        requestAnimationFrame(animate);
    };

    image.onerror = function () {
        if (countElement) {
            countElement.textContent =
                'Не вдалося завантажити фотографію ❤️';
        }
    };

    image.src = 'images/diana.jpg';
}



// ==========================================
// ЗАПУСК САЙТУ
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    startFloatingHearts();
});
