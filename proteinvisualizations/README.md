# 1A3N Protein Structure Explorer

CSCI 181DV: Advanced Data Visualization — Assignment 4

## Setup

1. Ensure the `datasets/1A3N/` folder contains `structure.json`, `chains.json`, and `components.json`
2. Serve the project with a local HTTP server:
   ```
   python3 -m http.server 8000
   ```
   Or use the VS Code Live Server extension.
3. Open `http://localhost:8000` in a WebVR-capable browser (Chrome, Firefox, Edge)
4. Click the VR goggles icon in the bottom-right to enter VR mode (requires a headset)

## Project Structure

```
index.html                  Main A-Frame scene
css/ui.css                  Control panel styles
js/protein-helpers.js       Utilities (colors, radii, InstancedMesh, spline)
js/app.js                   Application bootstrap and main rendering functions
js/components/
    vr-environment.js       Task 1: VR environment setup
    structure-handler.js    Task 2: Structure visualization
    interaction-manager.js  Task 3: Interactive features
    component-manager.js    Task 4: Chain & component visualization
    advanced-features.js    Task 5: Advanced features
datasets/1A3N/
    structure.json          Atom positions and bonds
    chains.json             Chain definitions
    components.json         Residue/component data with centroids
```

## Task 5 Features Implemented

<!-- List which advanced features you chose and briefly describe them -->

- Feature 1: ...
- Feature 2: ...

## Known Issues

<!-- List any known bugs or limitations -->

## AI Acknowledgement

<!-- Describe any AI tools used and how they helped -->
