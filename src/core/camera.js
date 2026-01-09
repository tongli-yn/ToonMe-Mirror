/**
 * Robust Camera Handler
 * Wraps getUserMedia to ensure we have a valid stream for both p5 and MediaPipe.
 */
export class CameraSource {
    constructor() {
        this.video = document.createElement('video');
        this.video.setAttribute('playsinline', '');
        this.video.style.display = 'none';
        document.body.appendChild(this.video);

        this.stream = null;
        this.isReady = false;
    }

    async start() {
        try {
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;

            return new Promise((resolve) => {
                this.video.onloadeddata = () => {
                    this.video.play();
                    this.isReady = true;
                    console.log(`[Camera] Started: ${this.video.videoWidth}x${this.video.videoHeight}`);
                    resolve(this.video);
                };
            });
        } catch (err) {
            console.error('[Camera] Error:', err);
            throw err;
        }
    }

    getVideoElement() {
        return this.video;
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }
}
