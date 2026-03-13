/**
 * vr-environment.js
 * Task 1: VR Environment Setup [5 points]
 *
 * This component manages the overall VR environment configuration.
 * The basic scene (lighting, camera, sky) is already set up in index.html.
 *
 * TODO:
 *   - Adjust lighting for optimal protein viewing (no harsh shadows)
 *   - Verify WASD + look-controls work on desktop
 *   - Verify VR mode enters correctly (click the VR goggles icon)
 *   - Ensure error handling works (try renaming a data file to test)
 *   - Optionally add a ground grid or reference axes for orientation
 */

AFRAME.registerComponent('vr-environment', {
    schema: {
        structureFile: { type: 'string' },
        displayMode: { type: 'string', default: 'basic' },
        highlightChain: { type: 'string' },
    },

    init: function () {
        console.log('vr-environment component initialized');

 console.log('vr-environment component initialized');

    const scene = this.el.sceneEl;

    // ----- Grid helper -----
    const grid = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
    grid.position.y = -3;
    scene.object3D.add(grid);

    // ----- Fog -----
    scene.setAttribute('fog', {
        type: 'linear',
        color: '#192d4d',
        near: 10,
        far: 50
    });

    // ----- VR controller events -----
    scene.addEventListener('controllerconnected', function (evt) {
        console.log('VR controller connected:', evt.detail.name);
    });

    scene.addEventListener('controllerdisconnected', function (evt) {
        console.log('VR controller disconnected:', evt.detail.name);
    });

    },

    // Called when schema properties change
    update: function (oldData) {
       // Structure file changed
        if (oldData.structureFile !== this.data.structureFile) {
            console.log('Structure file updated:', this.data.structureFile);
        }

        // Display mode changed
        if (oldData.displayMode !== this.data.displayMode) {
            console.log('Display mode changed to:', this.data.displayMode);

            const centroid = document.getElementById('centroid-view');
            const ballStick = document.getElementById('ball-stick-view');

            if (this.data.displayMode === 'centroid') {
                centroid.setAttribute('visible', true);
                ballStick.setAttribute('visible', false);
            }

            if (this.data.displayMode === 'ballstick') {
                centroid.setAttribute('visible', false);
                ballStick.setAttribute('visible', true);
            }
        }

        // Highlight chain changed
        if (oldData.highlightChain !== this.data.highlightChain) {
            console.log('Highlighting chain:', this.data.highlightChain);
        }
    },

    // Clean up when component is removed
    remove: function () {
         const scene = this.el.sceneEl;

        // Remove grid helper
        if (this.grid) {
            scene.object3D.remove(this.grid);
            this.grid = null;
        }

        // Remove fog
        scene.removeAttribute('fog');

        // Remove controller listeners
        scene.removeEventListener('controllerconnected', this.onControllerConnected);
        scene.removeEventListener('controllerdisconnected', this.onControllerDisconnected);

        console.log('vr-environment component removed and cleaned up');
    }
});
