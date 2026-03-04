/**
 * component-manager.js
 * Task 4: Component Visualization [20 points]
 *
 * This component manages chain visibility, component filtering,
 * labels, and color schemes.
 *
 * TODO:
 *   - Chain toggles: When a checkbox changes, show/hide all entities
 *     belonging to that chain. In centroid view, each sphere has
 *     data-chain attribute. Filter by this.
 *
 *   - Component filtering: Add UI (dropdown or buttons) to filter by
 *     residue type. For example, show only HEM (heme groups), or only
 *     HOH (water molecules), or only a specific amino acid.
 *
 *   - Labels: Create <a-text> entities positioned at residue centers
 *     that always face the camera (look-at="#camera-rig" or use
 *     billboard component). Toggle labels on/off.
 *
 *   - Color schemes: Implement switching between:
 *     * By chain: use CHAIN_COLORS
 *     * By element (CPK): use CPK_COLORS (for ball-and-stick view)
 *     * By residue type: use RESIDUE_COLORS
 *
 * The chain toggle wiring is started in app.js enableControls().
 */

AFRAME.registerComponent('component-manager', {
    schema: {
        activeChains: { type: 'array' },
        colorScheme: { type: 'string' },
        labelType: { type: 'string' }
    },

    init: function () {
        console.log('component-manager component initialized');

        // TODO: Manage visualization components
        // this.loadComponents();
        // this.setupVisibility();
        // this.updateColors();
    },

    /**
     * TODO: Show/hide all entities belonging to a specific chain.
     *
     * @param {string} chainId - 'A', 'B', 'C', or 'D'
     * @param {boolean} visible - true to show, false to hide
     *
     * Hints:
     *   - In centroid view, query: #centroid-view [data-chain="A"]
     *   - For ball-and-stick view with InstancedMesh, you'll need to
     *     track which instance indices belong to which chain and
     *     set their scale to 0 (hide) or restore it (show).
     */
    toggleChain: function (chainId, visible) {
        // Centroid view: toggle individual sphere entities
        const spheres = document.querySelectorAll(`#centroid-view [data-chain="${chainId}"]`);
        spheres.forEach(s => s.setAttribute('visible', visible));

        // TODO: Also handle ball-and-stick view if built
    },

    /**
     * TODO: Apply a color scheme to all visible entities.
     *
     * @param {string} scheme - 'chain', 'element', or 'residue'
     *
     * Hints:
     *   - For centroid view, iterate through spheres and set material color
     *   - For ball-and-stick view with InstancedMesh, you'll need to
     *     call mesh.setColorAt(index, newColor) and set instanceColor.needsUpdate
     */
    applyColorScheme: function (scheme) {
        const spheres = document.querySelectorAll('#centroid-view a-sphere');

        spheres.forEach(s => {
            let color;
            switch (scheme) {
                case 'chain':
                    color = CHAIN_COLORS[s.dataset.chain] || '#CCCCCC';
                    break;
                case 'residue':
                    color = RESIDUE_COLORS[s.dataset.type] || '#CCCCCC';
                    break;
                case 'element':
                    // Element coloring only makes sense in ball-and-stick view
                    color = CHAIN_COLORS[s.dataset.chain] || '#CCCCCC';
                    break;
                default:
                    color = '#CCCCCC';
            }
            s.setAttribute('material', 'color', color);
        });
    },

    /**
     * TODO: Create text labels at residue positions.
     *
     * Hints:
     *   - Create <a-text> entities with the residue name
     *   - Position them slightly above the residue center
     *   - Use look-at="#camera-rig" to make them face the camera
     *   - Consider only showing labels for non-water residues
     *   - Add a toggle button to show/hide all labels
     *
     * Example:
     *   const label = document.createElement('a-text');
     *   label.setAttribute('value', comp.type);
     *   label.setAttribute('position', `${comp.center[0]} ${comp.center[1] + 2} ${comp.center[2]}`);
     *   label.setAttribute('align', 'center');
     *   label.setAttribute('scale', '3 3 3');
     *   label.setAttribute('color', '#FFFFFF');
     *   label.setAttribute('look-at', '#camera-rig');
     *   container.appendChild(label);
     */
    createLabels: function () {

    }
});
