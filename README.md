# ToonMe Mirror 🎭✨

**ToonMe Mirror** is an interactive "Magic Mirror" web application that transforms your reflection into a stylized cartoon avatar in real-time. Powered by Edge AI (Google MediaPipe) and Creative Coding (p5.js), it offers a touch-free interface controllable entirely by hand gestures.

## 🌟 Features

*   **Real-time Face Mapping**: Seamlessly projects your face onto a 2D cartoon body.
*   **Gesture Control**: Touchless interaction for public health safety and convenience.
*   **Dynamic Outfits**: Switch between multiple themed costumes (Wizard, Superhero, Astronaut, etc.).
*   **Responsive Design**: Auto-adjusting canvas for different screen sizes.

## 🎮 How to Play

The interface is controlled by your hands!

1.  **Resize Avatar**:
    *   🖐️ **Open Hand (Spread)**: Move your hand closer/further or spread fingers to zoom in/out.
2.  **Switch Outfit**:
    *   Hover your hand over the **Prev (<)** or **Next (>)** buttons.
    *   🤏 **Pinch (Close Hand)** to click the button.

## 🛠️ Technology Stack

*   **Framework**: [Vite](https://vitejs.dev/) (Vanilla JS)
*   **AI/CV**: [MediaPipe Hands & FaceMesh](https://developers.google.com/mediapipe)
*   **Graphics**: [p5.js](https://p5js.org/)
*   **Styling**: CSS3, Google Fonts (Fredoka One)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v16+)
*   npm (v7+)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/tongli-yn/ToonMe-Mirror.git
    cd ToonMe-Mirror
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser at `http://localhost:5173`.

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
