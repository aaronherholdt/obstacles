# Obstacle Course Builder MVP

A simple web-based obstacle course building game MVP using Three.js.

## Features (MVP)

*   Basic 3D environment.
*   Ground plane.
*   Orbit controls for camera navigation.
*   Placeholder cube.

## How to Run

1.  You need a local web server to run this project because browsers restrict loading modules (`script.js` imports `three`) directly from the file system (`file://`).
2.  If you have Python installed, navigate to the project directory in your terminal and run:
    *   Python 3: `python -m http.server`
    *   Python 2: `python -m SimpleHTTPServer`
3.  If you have Node.js installed, you can use the `serve` package:
    *   Install it globally: `npm install -g serve`
    *   Navigate to the project directory and run: `serve .`
4.  Open your web browser and go to `http://localhost:8000` (or the port specified by your server).

## Next Steps

*   Implement block placement logic.
*   Implement block removal logic.
*   Add basic character controls for testing courses. 