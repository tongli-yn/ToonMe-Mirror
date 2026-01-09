import p5 from 'p5';
import { CameraSource } from './core/camera.js';
import { VisionSystem } from './core/vision.js';
import { createSketch } from './sketches/sketch.js';

async function main() {
    console.log("Starting ToonMe Mirror...");

    try {
        // 1. Init Camera
        updateLoading("Requesting Camera Access...");
        const camera = new CameraSource();
        const videoElement = await camera.start();

        // 2. Init Vision
        updateLoading("Loading AI Models... (5-10s)");
        const vision = new VisionSystem();
        await vision.initialize();

        // 3. Start P5
        updateLoading("Starting Canvas...");
        const sketch = createSketch(camera, vision);
        new p5(sketch, document.body); // Attach to body

        // 4. Processing Loop
        // We run the vision inference in a separate loop from p5 draw if possible, 
        // or just drive it as fast as possible.

        const loop = async () => {
            if (camera.isReady) {
                try {
                    await vision.processFrame(videoElement);
                } catch (e) {
                    console.error("Frame Error:", e);
                    if (!vision.isLoaded) {
                        updateLoading("AI Load Error: " + e.message);
                    }
                }
            }
            requestAnimationFrame(loop);
        };
        loop();

    } catch (e) {
        console.error("Initialization Failed:", e);
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.innerText = "Error: " + e.message;
            statusEl.className = "status-badge error";
        }
        updateLoading("Error: " + e.message + ". Check console.");
    }
}

function updateLoading(msg) {
    console.log(msg);
    const overlay = document.querySelector('#loading-overlay h2');
    if (overlay) overlay.innerText = msg;
}


window.addEventListener('DOMContentLoaded', main);
