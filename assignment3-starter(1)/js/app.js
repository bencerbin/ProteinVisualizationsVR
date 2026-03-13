/**
 * app.js
 * Main application entry point.
 * Loads protein data and initializes the visualization.
 *
 * This file handles bootstrapping only. The actual visualization
 * logic lives in the component files under js/components/.
 */

// Global reference to loaded protein data
// Access from any component via: window.proteinData
window.proteinData = null;

// Wait for A-Frame scene to be ready
document.addEventListener('DOMContentLoaded', function () {
    const scene = document.querySelector('a-scene');

    scene.addEventListener('loaded', async function () {
        console.log('A-Frame scene loaded');
        await initApp();
    });
});

/**
 * Initialize the application: load data and build the visualization.
 */
async function initApp() {
    const statusEl = document.getElementById('status');
    const errorEl = document.getElementById('error-display');

    try {
        // ---- Step 1: Load protein data ----
        statusEl.textContent = 'Loading protein data...';
        window.proteinData = await loadProteinData('datasets/1A3N');
        statusEl.textContent = `Loaded: ${window.proteinData.structure.vertices.length} atoms, ` +
                               `${Object.keys(window.proteinData.components).length} residues`;

        // ---- Step 2: Build centroid view (Task 2a) ----
        buildCentroidView(window.proteinData);

        // ---- Step 3: Enable UI controls ----
        enableControls();

        console.log('Protein visualization ready');

    } catch (err) {
        // Task 1: Error handling - show user-friendly message
        console.error('Failed to initialize:', err);
        statusEl.textContent = 'Error loading data';
        errorEl.style.display = 'block';
        errorEl.textContent = `Error: ${err.message}. Check that the datasets/1A3N/ folder contains structure.json, chains.json, and components.json.`;
    }
}

/**
 * Task 2a: Build the residue-centroid view.
 * Renders one sphere per residue using the pre-computed center positions.
 *
 * TODO: Complete this function.
 *       For each component in proteinData.components:
 *       - Create an <a-sphere> entity
 *       - Set its position to the component's center [x, y, z]
 *       - Set its color based on chain (use CHAIN_COLORS)
 *       - Set radius (e.g. 1.0 for amino acids, 1.5 for HEM, 0.5 for HOH)
 *       - Add class="clickable" so raycaster can detect it
 *       - Append it to the #centroid-view entity
 *
 * Hint: You can store metadata on the entity using .dataset or
 *       el.setAttribute('data-residue', key) for use in Task 3.
 */
function buildCentroidView(data) {
    const container = document.getElementById('centroid-view');
    if (!container) {
        console.error('Centroid view container not found');
        return;
    }

    Object.entries(data.components).forEach(([key, comp]) => {

        const sphere = document.createElement('a-sphere');

        // position
        sphere.setAttribute(
            'position',
            `${comp.center[0]} ${comp.center[1]} ${comp.center[2]}`
        );

        // color by chain
        sphere.setAttribute(
            'color',
            CHAIN_COLORS[comp.chain] || '#CCCCCC'
        );

        // radius by type
        let radius = 1.0;
        if (comp.type === 'HEM') radius = 1.5;
        if (comp.type === 'HOH') radius = 0.5;

        sphere.setAttribute('radius', radius);

        // raycaster detection
        sphere.setAttribute('class', 'clickable');

        // metadata
        sphere.dataset.residue = key;
        sphere.dataset.chain = comp.chain;
        sphere.dataset.type = comp.type;

        container.appendChild(sphere);
    });
    

    // TODO: Implement centroid view rendering
    

    console.log('TODO: buildCentroidView - render', Object.keys(data.components).length, 'residues');
}

/**
 * Task 2b: Build the ball-and-stick view.
 * Uses InstancedMesh for efficient rendering of ~5000 atoms and ~4600 bonds.
 *
 * TODO: Complete this function.
 *       1. Build a vertex lookup map: { id: vertex }
 *       2. Create atom data array for createInstancedAtoms():
 *          atoms.push({ position: v.position, color: CPK_COLORS[v.element], radius: ... })
 *       3. Create bond data array for createInstancedBonds():
 *          bonds.push({ from: vertexMap[c.from].position, to: vertexMap[c.to].position })
 *       4. Add the returned meshes to #ball-stick-view's object3D
 *
 * Hint: Scale atom radii down (e.g. multiply VDW_RADII by 0.3) for ball-and-stick style.
 */
function buildBallStickView(data) {
    const container = document.getElementById('ball-stick-view');
    if (!container) {
        console.error('Ball-stick view container not found');
        return;
    }

    // TODO: Implement ball-and-stick rendering using InstancedMesh helpers
    //
    // Step 1: Build vertex lookup
    const vertexMap = {};
    data.structure.vertices.forEach(v => { vertexMap[v.id] = v; });
    //

    const atomMetadata = [];
    // Step 2: Prepare atom data
    const atoms = data.structure.vertices.map(v => {

        
    // determine chain
    let chain = null;
    for (const [chainId, chainData] of Object.entries(data.chains)) {
        if (chainData.atoms.includes(v.id)) {
            chain = chainId;
            break;
        }
    }

    // determine residue type
    let residueType = null;
    for (const comp of Object.values(data.components)) {
        if (comp.atoms.includes(v.id)) {
            residueType = comp.type;
            break;
        }
    }

    atomMetadata.push({
        chain,
        residueType,
        element: v.element
    });

    return {
        position: v.position,
        color: CPK_COLORS[v.element] || '#CCCCCC',
        radius: (VDW_RADII[v.element] || 1.5) * 0.3
    };
    });
    //
    // Step 3: Prepare bond data
    const bonds = data.structure.connections.map(c => ({
        from: vertexMap[c.from].position,
        to: vertexMap[c.to].position,
        color: '#555555'
    }));
    //
    // Step 4: Create and add meshes
    const atomMesh = createInstancedAtoms(atoms);
    const bondMesh = createInstancedBonds(bonds, 0.10);
    container.object3D.add(atomMesh);
    container.object3D.add(bondMesh);

    const scene = document.querySelector('a-scene');
    scene.ballStickAtoms = atomMesh;
    scene.ballStickAtomMeta = atomMetadata;

    console.log('TODO: buildBallStickView - render', data.structure.vertices.length, 'atoms');
}

/**
 * Enable UI controls after data is loaded.
 * Wires up button clicks, checkboxes, etc.
 */
function enableControls() {
    // ---- Task 2c: View switching ----
    const btnCentroid = document.getElementById('btn-centroid');
    const btnBallStick = document.getElementById('btn-ball-stick');
    btnCentroid.disabled = false;
    btnBallStick.disabled = false;

    let ballStickBuilt = false;

    btnCentroid.addEventListener('click', function () {
        document.getElementById('centroid-view').setAttribute('visible', 'true');
        document.getElementById('ball-stick-view').setAttribute('visible', 'false');
        btnCentroid.classList.add('active');
        btnBallStick.classList.remove('active');
    });

    btnBallStick.addEventListener('click', function () {
        // Lazy-build ball-and-stick view on first switch (saves load time)
        if (!ballStickBuilt && window.proteinData) {
            buildBallStickView(window.proteinData);
            ballStickBuilt = true;
        }
        document.getElementById('centroid-view').setAttribute('visible', 'false');
        document.getElementById('ball-stick-view').setAttribute('visible', 'true');
        btnBallStick.classList.add('active');
        btnCentroid.classList.remove('active');
    });

    // ---- Task 4: Color scheme ----
    const colorSelect = document.getElementById('color-scheme');
    colorSelect.disabled = false;
    colorSelect.addEventListener('change', function () {

        const scene = document.querySelector('a-scene');
        const manager = scene.components['component-manager'];

        if (manager) {
                manager.applyColorScheme(colorSelect.value);
            }

        // TODO: Implement color scheme switching
        console.log('TODO: switch color scheme to', colorSelect.value);
    });

    // ---- Task 4: Label toggle ----
        const btnLabels = document.getElementById('btn-labels');
        btnLabels.disabled = false;

        let labelsBuilt = false;

        btnLabels.addEventListener('click', function () {

            const scene = document.querySelector('a-scene');
            const manager = scene.components['component-manager'];
            const labelContainer = document.getElementById('labels');

            if (!labelsBuilt) {
                manager.createLabels();
                labelsBuilt = true;
            }

            const visible = labelContainer.getAttribute('visible');
            labelContainer.setAttribute('visible', !visible);
        });

    // ---- Task 4: Chain toggles ----
    document.querySelectorAll('.chain-toggle').forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            const chain = this.dataset.chain;
            const visible = this.checked;

            const scene = document.querySelector('a-scene');
            const manager = scene.components['component-manager'];

            if (manager) {
                manager.toggleChain(chain, visible);
            }

            // TODO: Show/hide entities belonging to this chain
            console.log('TODO: toggle chain', chain, visible);
        });
    });

    // ---- Task 5: Measurement tool ----

        // TODO: Toggle measurement mode
        const btnMeasure = document.getElementById('btn-measure');
btnMeasure.disabled = false;

btnMeasure.addEventListener('click', function () {

            const scene = document.querySelector('a-scene');
            const features = scene.components['advanced-features'];

            if (!features) return;

            const currentMode = features.data.toolMode;

            if (currentMode === 'measure') {
                scene.setAttribute('advanced-features', 'toolMode', 'none');
                btnMeasure.classList.remove('active');
                console.log('Measurement mode OFF');
                features.clearMeasurements();
            } else {
                scene.setAttribute('advanced-features', 'toolMode', 'measure');
                btnMeasure.classList.add('active');
                console.log('Measurement mode ON');
            }
        });    

    // ---- Task 5: Guided tour ----
    const btnTour = document.getElementById('btn-tour');
    btnTour.disabled = false;
    btnTour.addEventListener('click', function () {
        // TODO: Start guided tour animation
        const scene = document.querySelector('a-scene');
        const features = scene.components['advanced-features'];

        if(!features) return;

        if(features.data.viewMode =="normal") {
            btnTour.classList.add('active');
            scene.setAttribute('advanced-features', 'viewMode', 'tour');
            features.startTour();
        }
        else {
            btnTour.classList.remove('active');
            scene.setAttribute('advanced-features', 'viewMode', 'normal');
        }


        console.log('TODO: start guided tour');
    });
}
