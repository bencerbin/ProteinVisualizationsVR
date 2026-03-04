/**
 * interaction-manager.js
 * Task 3: Interactive Features [25 points]
 *
 * This component handles user interaction with the protein structure:
 * selection, rotation, zoom, and highlighting.
 *
 * TODO:
 *   - Selection: Listen for click/mouseenter events on .clickable entities.
 *     When a residue is clicked, read its data attributes (data-residue,
 *     data-chain, data-type) and display them in the #info-panel.
 *
 *   - Rotation: Allow dragging to rotate the #protein-root entity.
 *     Hint: Listen for mousedown/mousemove/mouseup on the scene,
 *     and update protein-root's rotation attribute.
 *
 *   - Zoom: Listen for wheel events and scale #protein-root up/down.
 *     Clamp the scale to reasonable bounds (e.g. 0.02 to 0.5).
 *
 *   - Highlighting: When a residue is selected, change its material
 *     to emissive/bright and dim all others (e.g. reduce opacity).
 */

AFRAME.registerComponent('interaction-manager', {
    schema: {
        activeElements: { type: 'array' },
        colorScheme: { type: 'string' },
        labelType: { type: 'string' }
    },

    init: function () {
        console.log('interaction-manager component initialized');

        this.selectedResidue = null;

        // TODO: Setup interaction systems
        // this.setupSelection();
        // this.setupRotation();
        // this.setupZoom();
    },

    /**
     * TODO: Setup click/gaze selection on .clickable entities.
     *
     * Hints:
     *   - For centroid view, each <a-sphere> has class="clickable"
     *     and data attributes you set in buildCentroidView()
     *   - Listen for 'click' event on the scene or on individual entities
     *   - Use event.detail.intersection to get the clicked entity
     *   - Update #info-panel with the residue information
     *
     * Example:
     *   this.el.sceneEl.addEventListener('click', (evt) => {
     *       const target = evt.detail.intersectedEl;
     *       if (target && target.dataset.residue) {
     *           this.selectResidue(target);
     *       }
     *   });
     */
    setupSelection: function () {

    },

    /**
     * TODO: Display info about the selected residue in the #info-panel.
     *
     * @param {Element} el - The clicked A-Frame entity
     */
    selectResidue: function (el) {
        const infoPanel = document.getElementById('info-panel');
        const infoContent = document.getElementById('info-content');

        // TODO: Show the info panel and populate it
        // infoPanel.style.display = 'block';
        // infoContent.innerHTML = `
        //     <strong>${el.dataset.residue}</strong><br>
        //     Type: ${el.dataset.type}<br>
        //     Chain: ${el.dataset.chain}
        // `;

        // TODO: Highlight this residue, dim others
    },

    /**
     * TODO: Allow rotating the protein by dragging.
     *
     * Hints:
     *   - Track mousedown -> mousemove -> mouseup
     *   - On mousemove, compute delta and apply to #protein-root rotation
     *   - Use el.setAttribute('rotation', {x, y, z}) on #protein-root
     *   - Sensitivity: ~0.5 degrees per pixel of mouse movement works well
     */
    setupRotation: function () {

    },

    /**
     * TODO: Allow zooming with mouse wheel.
     *
     * Hints:
     *   - Listen for 'wheel' event on the canvas or scene
     *   - Adjust the scale of #protein-root
     *   - Clamp between reasonable bounds (e.g. 0.02 to 0.5)
     *
     * Example:
     *   document.querySelector('canvas').addEventListener('wheel', (evt) => {
     *       const root = document.getElementById('protein-root');
     *       const currentScale = root.object3D.scale.x;
     *       const newScale = Math.max(0.02, Math.min(0.5, currentScale - evt.deltaY * 0.0005));
     *       root.setAttribute('scale', `${newScale} ${newScale} ${newScale}`);
     *   });
     */
    setupZoom: function () {

    }
});
