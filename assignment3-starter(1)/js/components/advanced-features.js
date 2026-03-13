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
         this.setupMeasurement();
         this.setupTour();
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
    this.measureLabels = [];

    const scene = this.el.sceneEl;

    scene.addEventListener('click', (evt) => {

        if (this.data.toolMode !== 'measure') return;

        const target = evt.detail.intersectedEl;

        if (target && target.dataset.residue) {
            this.handleAtomClick(target);
        }

    });
},

handleAtomClick: function(atomEl) {

    const pos = atomEl.object3D.position.clone();
    this.measurePoints.push(pos);

    // first click -> store only
    if (this.measurePoints.length < 2) return;

    const a = this.measurePoints[0];
    const b = this.measurePoints[1];

    // distance formula
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;

    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

    this.drawMeasurement(a, b, distance);

    // reset for next measurement
    this.measurePoints = [];
},

drawMeasurement: function(a, b, distance) {

    const scene = this.el.sceneEl;

    // create line
    const line = document.createElement('a-entity');

    line.setAttribute('line', {
        start: `${a.x} ${a.y} ${a.z}`,
        end: `${b.x} ${b.y} ${b.z}`,
        color: '#FFD700'
    });

    const root = document.getElementById('protein-root');
    root.appendChild(line);
    this.measureLines.push(line);

    // midpoint for label
    const mid = {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        z: (a.z + b.z) / 2
    };

    const label = document.createElement('a-entity');

    label.setAttribute('position', `${mid.x} ${mid.y} ${mid.z}`);
    label.setAttribute('text', {
        value: distance.toFixed(2) + " Å",
        color: "#FFD700",
        align: "center",
        width: 4
    });

    root.appendChild(label);
    console.log(distance);
    this.measureLabels.push(label);
},

clearMeasurements: function() {

    this.measureLines.forEach(line => line.remove());
    this.measureLabels.forEach(label => label.remove());

    this.measureLines = [];
    this.measureLabels = [];
    this.measurePoints = [];
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
        this.cameraRig = document.getElementById('camera-rig');


        //NOTE: I know nothing about chemistry (especially not this advanced) so I asked ChatGPT for the descriptions. 
        this.tourStops = [
        {
            name: 'Overview',
            position: '1.5 0.2 12',
            target: '1.5 0.2 1.4',
            description: 'Hemoglobin is a tetramer composed of two alpha and two beta subunits. Each subunit contains a heme group capable of binding oxygen.'
        },
        {
            name: 'Heme A',
            position: '1.6 1.0 2.5',
            target: '1.57 0.94 1.24',
            description: 'This is the heme group of an alpha chain. The iron atom in the center of the heme binds oxygen molecules in red blood cells.'
        },
        {
            name: 'Heme B',
            position: '1.3 -0.5 2.7',
            target: '1.31 -0.66 1.39',
            description: 'This heme group belongs to a beta chain. Structural differences between alpha and beta chains help regulate oxygen binding.'
        }
    ];
        this.currentStop = 0;
        this.el.setAttribute('advanced-features', 'viewMode', 'normal');    },

    startTour: function () {

    this.currentStop = 0;
this.el.setAttribute('advanced-features', 'viewMode', 'tour');    this.goToStop();

},

    goToStop: function() {


        if (this.currentStop >= this.tourStops.length) {
            
            console.log("Tour finished");

            this.data.viewMode = "normal";

            document.getElementById('info-panel').style.display = 'none';

            return;
    }


           const stop = this.tourStops[this.currentStop];
        const rig = this.cameraRig;

        const panel = document.getElementById('info-panel');
        const content = document.getElementById('info-content');

        panel.style.display = 'block';
        content.innerHTML = `
        <strong>${stop.name}</strong><br><br>
        ${stop.description}
    `;

        console.log("Tour stop:", stop.name);

        rig.setAttribute('animation__tour', {
            property: 'position',
            to: stop.position,
            dur: 2000,
            easing: 'easeInOutQuad'
        });

        rig.setAttribute('look-at', stop.target);

        rig.addEventListener('animationcomplete__tour', () => {

            setTimeout(() => {
                this.currentStop++;
                this.goToStop();
            }, 2000);

        }, { once: true });
        }

});
