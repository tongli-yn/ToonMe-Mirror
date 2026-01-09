import { FaceMesh } from '@mediapipe/face_mesh';
import { Hands } from '@mediapipe/hands';

export class VisionSystem {
    constructor() {
        this.faceResults = null;
        this.handResults = null;
        this.isLoaded = false;
        this.isReady = false; // "Ready" means we have results or at least ran once successfully

        // stats
        this.lastProcessTime = 0;
    }

    async initialize() {
        // Face Mesh
        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });
        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        this.faceMesh.onResults((res) => {
            this.faceResults = res;
            if (res.multiFaceLandmarks.length > 0) this.isReady = true;
            this.isLoaded = true;
        });


        // Hands
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });
        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        this.hands.onResults((res) => {
            this.handResults = res;
        });

        console.log("[Vision] Models Initialized");
    }

    async processFrame(videoElement) {
        if (!videoElement || videoElement.readyState < 2) return;

        // We can send to both in parallel?
        // JS is single threaded but the internal MP logic might be async.
        // Actually send() is async.

        // Throttle to 30fps if needed, or just let it fly.
        // For stability, sequential might be safer for now, or Promise.all
        // Execute sequentially to avoid Emscripten global race conditions (Module.arguments error)
        try {
            await this.faceMesh.send({ image: videoElement });
            await this.hands.send({ image: videoElement });

            this.isLoaded = true;
        } catch (e) {
            console.error("MP Send Error:", e);
            throw e;
        }
    }

    getFace() {
        return this.faceResults?.multiFaceLandmarks?.[0] || null;
    }

    getHands() {
        return this.handResults?.multiHandLandmarks || [];
    }
}
