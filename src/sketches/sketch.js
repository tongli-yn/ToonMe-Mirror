import p5 from 'p5';
import { OUTFITS } from '../config/outfits.js';

export function createSketch(cameraSource, visionSystem) {
    return (p) => {
        // State
        let currentOutfitIdx = 0;
        let avatarScale = { w: 1.0, h: 1.0 };
        let targetScale = { w: 1.0, h: 1.0 };

        // UI Interaction
        let hoverState = { prev: 0, next: 0 };
        const HOVER_THRESHOLD = 15;

        let swipeCooldown = 0;

        let debugMode = false;

        p.setup = () => {
            p.createCanvas(p.windowWidth, p.windowHeight);
            p.frameRate(30);

            // Listen to debug toggle
            const toggle = document.getElementById('debugToggle');
            if (toggle) toggle.addEventListener('change', e => debugMode = e.target.checked);
        };

        p.windowResized = () => {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };

        p.draw = () => {
            // Background
            p.background(20);
            drawBackgroundPattern(p);

            // Interpolate Scale
            avatarScale.w = p.lerp(avatarScale.w, targetScale.w, 0.1);
            avatarScale.h = p.lerp(avatarScale.h, targetScale.h, 0.1);

            // --- GESTURE LOGIC ---
            processGestures();

            // --- UI RENDER ---
            drawUIButtons();

            // --- RENDER SCENE ---
            p.push();
            p.translate(p.width / 2, p.height / 2 + 100);
            p.scale(-1, 1);

            const face = visionSystem.getFace();
            const outfit = OUTFITS[currentOutfitIdx];

            if (visionSystem.isReady && face) {
                updateStatus("Active", "active");
                drawBody(p, outfit, avatarScale);
                drawFaceMapped(p, face, outfit);

            } else {
                const msg = visionSystem.isLoaded ? "Looking for you..." : "Initializing AI...";
                const style = visionSystem.isLoaded ? "loading" : "loading";
                updateStatus(msg, style);

                // Silhouette
                p.noStroke();
                p.fill(60);
                p.ellipse(0, -100, 160, 220);
                p.rect(-60, 0, 120, 150);
            }
            p.pop();

            // --- HAND EFFECTS ---
            const hands = visionSystem.getHands();
            if (hands && hands.length > 0) {
                drawHandEffects(p, hands);
            }

            if (debugMode) drawDebug(p);
        };

        function processGestures() {
            const hands = visionSystem.getHands();

            // Reset hover visuals
            hoverState.prev = 0;
            hoverState.next = 0;

            if (swipeCooldown > 0) swipeCooldown--;

            for (const hand of hands) {
                const index = hand[8]; // Index Tip
                const thumb = hand[4];
                const pinky = hand[20];

                const sx = (1 - index.x) * p.width;
                const sy = index.y * p.height;

                // 1. SCALE (Open Hand spread)
                const spread = p.dist(thumb.x, thumb.y, pinky.x, pinky.y);
                if (spread > 0.05) {
                    let s = p.map(spread, 0.15, 0.35, 0.8, 1.5, true);
                    targetScale.w = s;
                    targetScale.h = s;
                }

                // 2. BUTTONS (Pinch to Click)
                const pinchDist = p.dist(thumb.x, thumb.y, index.x, index.y);
                const isClosed = pinchDist < 0.05;

                // Prev Box
                if (p.dist(sx, sy, 80, p.height / 2) < 100) {
                    hoverState.prev = HOVER_THRESHOLD;
                    if (isClosed && swipeCooldown <= 0) {
                        changeOutfit(-1);
                        swipeCooldown = 20;
                    }
                }

                // Next Box
                if (p.dist(sx, sy, p.width - 80, p.height / 2) < 100) {
                    hoverState.next = HOVER_THRESHOLD;
                    if (isClosed && swipeCooldown <= 0) {
                        changeOutfit(1);
                        swipeCooldown = 20;
                    }
                }
            }
        }

        function changeOutfit(dir) {
            currentOutfitIdx = (currentOutfitIdx + dir + OUTFITS.length) % OUTFITS.length;
        }

        function drawBackgroundPattern(p) {
            p.noStroke();
            let t = p.millis() * 0.001;
            const c = OUTFITS[currentOutfitIdx].colors.body;
            p.fill(c[0], c[1], c[2], 20);
            for (let i = 0; i < 5; i++) {
                let x = p.map(Math.sin(t + i), -1, 1, 0, p.width);
                let y = p.map(Math.cos(t + i * 0.7), -1, 1, 0, p.height);
                p.circle(x, y, 300 + i * 50);
            }
        }

        function drawBody(p, outfit, scale) {
            p.push();
            p.scale(scale.w, scale.h);
            const c = outfit.colors;

            // Neck
            p.fill(255, 200, 150);
            p.noStroke();
            p.rect(-35, -180, 70, 200);

            // Outfits
            if (outfit.id === 'SUPERHERO') {
                p.fill(c.cape);
                p.beginShape();
                p.vertex(-90, 0); p.vertex(90, 0);
                p.vertex(140, 320); p.vertex(0, 280); p.vertex(-140, 320);
                p.endShape(p.CLOSE);
                p.fill(c.body);
                p.rect(-65, 0, 130, 220, 15);
                p.fill(c.emblem);
                p.triangle(-30, 60, 30, 60, 0, 110);
            } else if (outfit.id === 'ASTRONAUT') {
                p.fill(c.body);
                p.rect(-75, 0, 150, 230, 25);
                p.fill(c.detail);
                p.rect(-50, 40, 100, 80, 5);
                p.fill(c.badge1); p.circle(-35, 65, 15);
                p.fill(c.badge2); p.circle(35, 65, 15);
            } else if (outfit.id === 'DINO') {
                p.fill(c.body);
                p.beginShape(); p.vertex(-70, 160); p.vertex(-130, 260); p.vertex(-50, 220); p.endShape();
                p.rect(-75, 0, 150, 220, 40);
                p.fill(c.belly); p.ellipse(0, 110, 90, 140);
            } else if (outfit.id === 'WIZARD') {
                p.fill(c.body);
                p.beginShape(); p.vertex(-70, 0); p.vertex(70, 0); p.vertex(100, 300); p.vertex(-100, 300); p.endShape(p.CLOSE);
                p.fill(c.stars); p.circle(-40, 100, 10); p.circle(50, 200, 15); p.circle(20, 150, 8);
            } else if (outfit.id === 'COWBOY') {
                p.fill(c.shirt); p.rect(-70, 0, 140, 150);
                p.fill(c.body); p.rect(-70, 150, 140, 150);
                p.fill(c.body); p.rect(-70, 0, 40, 120); p.rect(30, 0, 40, 120);
                p.fill(c.scarf); p.triangle(-40, 20, 40, 20, 0, 80);
            } else if (outfit.id === 'PIRATE') {
                p.fill(c.shirt); p.rect(-70, 0, 140, 180);
                p.fill(c.body); p.rect(-75, 0, 50, 140); p.rect(25, 0, 50, 140);
                p.fill(c.sash); p.rect(-72, 160, 144, 40);
            }

            // Arms
            p.fill(c.body);
            if (outfit.id === 'COWBOY' || outfit.id === 'PIRATE') p.fill(c.shirt);
            p.ellipse(-85, 60, 45, 130);
            p.ellipse(85, 60, 45, 130);
            p.pop();
        }

        function drawFaceMapped(p, landmarks, outfit) {
            const top = landmarks[10];
            const bottom = landmarks[152];
            const left = landmarks[234];
            const right = landmarks[454];

            const headW = 260 * avatarScale.w;
            const headH = 320 * avatarScale.h;

            const vid = cameraSource.getVideoElement();
            if (vid.videoWidth === 0) return;

            // Box
            let boxMinX = Math.min(left.x, right.x, top.x, bottom.x);
            let boxMaxX = Math.max(left.x, right.x, top.x, bottom.x);
            let boxMinY = Math.min(top.y, bottom.y);
            let boxMaxY = Math.max(top.y, bottom.y);
            const pad = 0.05;
            boxMinX = Math.max(0, boxMinX - pad);
            boxMaxX = Math.min(1, boxMaxX + pad);
            boxMinY = Math.max(0, boxMinY - pad);
            boxMaxY = Math.max(1, boxMaxY + pad);

            const sx = boxMinX * vid.videoWidth;
            const sy = boxMinY * vid.videoHeight;
            const sw = (boxMaxX - boxMinX) * vid.videoWidth;
            const sh = (boxMaxY - boxMinY) * vid.videoHeight;

            p.push();
            p.translate(0, -180 * avatarScale.h);
            const angle = Math.atan2(right.y - left.y, right.x - left.x);
            p.rotate(angle);

            p.noStroke();
            p.fill(255, 200, 150);
            p.ellipse(0, 0, headW, headH);

            const ctx = p.drawingContext;
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(0, 0, headW * 0.4, headH * 0.45, 0, 0, 2 * Math.PI);
            ctx.clip();

            try {
                if (vid && vid.readyState >= 2) {
                    const scale = 1.2;
                    ctx.drawImage(vid, sx, sy, sw, sh, -headW * (scale / 2), -headH * (scale / 2), headW * scale, headH * scale);
                }
            } catch (e) { }
            ctx.restore();

            // Accessories
            p.noFill();
            p.strokeWeight(5);
            if (outfit.id === 'WIZARD') {
                p.fill(outfit.colors.hat); p.noStroke(); p.triangle(-100, -100, 100, -100, 0, -320); p.ellipse(0, -100, 260, 50);
            } else if (outfit.id === 'COWBOY') {
                p.fill(100, 50, 0); p.noStroke(); p.arc(0, -120, 200, 160, p.PI, 0); p.ellipse(0, -100, 300, 60);
            } else if (outfit.id === 'PIRATE') {
                p.fill(200, 0, 0); p.noStroke(); p.arc(0, -100, 240, 180, p.PI, 0); p.rect(-120, -100, 240, 40); p.circle(120, -80, 40);
            } else if (outfit.id === 'SUPERHERO') {
                p.fill(outfit.colors.cape); p.noStroke(); p.rect(-110, -140, 220, 60, 10);
                p.triangle(-110, -110, -150, -160, -110, -140); p.triangle(110, -110, 150, -160, 110, -140);
            } else if (outfit.id === 'DINO') {
                p.fill(0, 200, 50); p.noStroke();
                p.triangle(0, -180, -30, -140, 30, -140);
                p.triangle(-60, -160, -90, -120, -30, -120);
                p.triangle(60, -160, 90, -120, 30, -120);
            } else if (outfit.id === 'ASTRONAUT') {
                p.noFill(); p.stroke(220); p.strokeWeight(15); p.arc(0, 0, headW * 1.1, headH * 1.1, p.PI, 0);
            }
            p.pop();
        }

        function drawHandEffects(p, hands) {
            p.push();
            const tips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky

            for (const hand of hands) {
                const ctx = p.drawingContext;
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'cyan';
                p.noStroke();
                p.fill(0, 255, 255); // Cyan for all

                for (let i = 0; i < tips.length; i++) {
                    const lm = hand[tips[i]];
                    const x = (1 - lm.x) * p.width;
                    const y = lm.y * p.height;

                    p.circle(x, y, 15); // Uniform size
                }

                ctx.shadowBlur = 0;
            }
            p.pop();
        }

        function drawDebug(p) {
            p.fill(0, 255, 0);
            p.noStroke();
            p.textSize(16);
            p.textAlign(p.LEFT, p.TOP);
            p.text(`FPS: ${p.frameRate().toFixed(1)}`, 20, p.height - 100);
            p.text(`Outfit: ${OUTFITS[currentOutfitIdx].name}`, 20, p.height - 80);
            p.text(`Scale: ${avatarScale.w.toFixed(2)}`, 20, p.height - 60);
        }

        function updateStatus(text, className) {
            const el = document.getElementById('status');
            if (el && el.innerText !== text) {
                el.innerText = text;
                el.className = `status-badge ${className}`;
                if (className === 'active' || text === "Looking for you...") {
                    const overlay = document.getElementById('loading-overlay');
                    if (overlay && overlay.style.opacity !== '0') {
                        overlay.style.opacity = '0';
                        setTimeout(() => overlay.style.display = 'none', 500);
                    }
                }
            }
        }

        function drawUIButtons() {
            p.push();
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(30);

            // Prev
            const prevFill = p.map(hoverState.prev, 0, HOVER_THRESHOLD, 0, 255);
            p.fill(255, 100); p.circle(80, p.height / 2, 150);
            p.fill(0, 255, 255, prevFill); p.circle(80, p.height / 2, 150);
            p.fill(255); p.text("<", 80, p.height / 2);

            // Next
            const nextFill = p.map(hoverState.next, 0, HOVER_THRESHOLD, 0, 255);
            p.fill(255, 100); p.circle(p.width - 80, p.height / 2, 150);
            p.fill(0, 255, 255, nextFill); p.circle(p.width - 80, p.height / 2, 150);
            p.fill(255); p.text(">", p.width - 80, p.height / 2);

            // Bottom Text
            p.textSize(16);
            p.fill(255, 200);
            p.text("Open Hand = Resize | Pinch Button = Switch", p.width / 2, p.height - 30);
            p.pop();
        }
    };
}
