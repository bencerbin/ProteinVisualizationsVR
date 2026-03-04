/**
 * advanced-features.js
 * Task 5: Advanced Features [25 points]
 *
 * Implement TWO OR MORE of the following features:
 *
 * 1. Distance Measurement
 *    - Click two atoms to display the distance in angstroms
 *    - Draw a dashed line between them with a label
 *
 * 2. Guided Tour Animation
 *    - Camera flies to each chain in sequence
 *    - Smooth transitions with pauses at key features (heme groups)
 *
 * 3. Clipping Plane
 *    - A moveable plane that slices through the protein
 *    - Reveals interior atoms on one side
 *
 * 4. Ribbon Visualization (Bonus)
 *    - Extract C-alpha backbone using extractBackbone()
 *    - Generate smooth curve using catmullRomSpline()
 *    - Render as TubeGeometry
 *
 * Document which features you implemented in your README.md.
 */

AFRAME.registerComponent('advanced-features', {
    schema: {
        toolMode: { type: 'string' },
        animationSpeed: { type: 'number' },
        viewMode: { type: 'string' }
    },

    init: function () {
        console.log('advanced-features component initialized');

        // TODO: Setup your chosen advanced features
        // this.setupMeasurement();
        // this.setupTour();
        // this.setupClipping();
        // this.setupRibbon();
    },

    // ================================================================
    // Feature 1: Distance Measurement
    // ================================================================

    /**
     * TODO: Implement distance measurement between two atoms.
     *
     * Hints:
     *   - Track a "measurement mode" state (on/off)
     *   - When active, the first click selects atom A, second click selects atom B
     *   - Compute distance: Math.sqrt((ax-bx)^2 + (ay-by)^2 + (az-bz)^2)
     *   - The distance is in angstroms (the native unit of the data)
     *   - Draw a line between the two points using <a-entity> with a line component:
     *     el.setAttribute('line', { start, end, color: '#FFD700' })
     *   - Create a text label at the midpoint showing the distance
     *   - Allow clearing measurements
     */
    setupMeasurement: function () {
        this.measurePoints = [];
        this.measureLines = [];
    },

    // ================================================================
    // Feature 2: Guided Tour
    // ================================================================

    /**
     * TODO: Implement a guided tour that flies the camera to key locations.
     *
     * Hints:
     *   - Define waypoints (camera positions + look-at targets):
     *     * Overview position (see the whole protein)
     *     * Chain A heme group (HEM_142 center ≈ [15.7, 9.4, 12.4])
     *     * Chain B heme group (HEM_147 center ≈ [13.1, -6.6, 13.9])
     *     * Subunit interface (midpoint between chains)
     *   - Use A-Frame animation component or manual tweening:
     *     cameraRig.setAttribute('animation', {
     *         property: 'position',
     *         to: '1.5 0.9 2.5',
     *         dur: 2000,
     *         easing: 'easeInOutQuad'
     *     });
     *   - Chain animations with setTimeout or animation events
     *   - Add text descriptions at each stop
     *
     * Note: Camera positions are in scene coordinates (after 0.1 scale),
     *       so divide angstrom coordinates by 10.
     */
    setupTour: function () {
        this.tourStops = [
            { name: 'Overview', position: '1.5 0.2 12', target: '1.5 0.2 1.4' },
            { name: 'Heme A', position: '1.6 1.0 2.5', target: '1.57 0.94 1.24' },
            { name: 'Heme B', position: '1.3 -0.5 2.7', target: '1.31 -0.66 1.39' },
            // TODO: Add more stops
        ];
        this.currentStop = 0;
    },

    // ================================================================
    // Feature 3: Clipping Plane
    // ================================================================

    /**
     * TODO: Implement a clipping plane that slices through the protein.
     *
     * Hints:
     *   - Use Three.js clipping planes on the material:
     *     renderer.clippingPlanes = [new THREE.Plane(normal, constant)];
     *   - Or per-material: material.clippingPlanes = [plane];
     *   - Enable clipping: renderer.localClippingEnabled = true;
     *   - Add a slider to move the plane along one axis
     *   - Optionally visualize the plane itself as a semi-transparent quad
     *
     * Example:
     *   const renderer = this.el.sceneEl.renderer;
     *   renderer.localClippingEnabled = true;
     *   const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 5);
     *   // Apply to materials of your meshes
     */
    setupClipping: function () {

    },

    // ================================================================
    // Feature 4: Ribbon Visualization (Bonus)
    // ================================================================

    /**
     * TODO: Render a ribbon/tube along the protein backbone.
     *
     * Steps:
     *   1. For each chain, extract backbone C-alpha positions:
     *      const caPositions = extractBackbone(window.proteinData, 'A');
     *
     *   2. Generate smooth spline:
     *      const splinePoints = catmullRomSpline(caPositions, 10);
     *
     *   3. Convert to Three.js curve:
     *      const curvePoints = splinePoints.map(p => new THREE.Vector3(p[0], p[1], p[2]));
     *      const curve = new THREE.CatmullRomCurve3(curvePoints);
     *
     *   4. Create tube geometry:
     *      const tubeGeom = new THREE.TubeGeometry(curve, curvePoints.length, 0.5, 8, false);
     *      const tubeMat = new THREE.MeshPhongMaterial({ color: CHAIN_COLORS[chainId] });
     *      const tube = new THREE.Mesh(tubeGeom, tubeMat);
     *
     *   5. Add to scene:
     *      document.getElementById('protein-root').object3D.add(tube);
     *
     *   6. Repeat for all four chains.
     *
     * This is the most challenging feature. The spline helper functions
     * are provided for you - the main work is wiring them together and
     * getting the visual result to look good.
     */
    setupRibbon: function () {

    }
});
