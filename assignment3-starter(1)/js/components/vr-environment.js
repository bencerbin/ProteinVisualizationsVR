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
        highlightChain: { type: 'string' }
    },

    init: function () {
        console.log('vr-environment component initialized');

        // TODO: Any additional environment setup
        // For example, you could:
        // - Add a grid helper for spatial reference
        // - Configure fog for depth perception
        // - Set up VR controller event listeners
    },

    // Called when schema properties change
    update: function (oldData) {
        // TODO: React to property changes if needed
    },

    // Clean up when component is removed
    remove: function () {
        // TODO: Clean up any resources
    }
});
