/**
 * protein-helpers.js
 * Utility functions for protein visualization.
 * This file is PROVIDED - you should not need to modify it,
 * but you should understand what it offers.
 *
 * Contents:
 *   1. CPK_COLORS        - Element -> hex color mapping
 *   2. VDW_RADII         - Element -> van der Waals radius (angstroms)
 *   3. CHAIN_COLORS       - Chain ID -> hex color mapping
 *   4. RESIDUE_COLORS     - Residue type -> hex color mapping
 *   5. loadProteinData()  - Fetch and parse all three JSON files
 *   6. createInstancedAtoms()  - Batch-render atoms with InstancedMesh
 *   7. createInstancedBonds()  - Batch-render bonds with InstancedMesh
 *   8. catmullRomSpline() - Generate smooth curve through control points
 *   9. extractBackbone()  - Extract C-alpha atoms for ribbon rendering
 */

// ============================================================
// 1. CPK Element Colors (standard molecular coloring)
// ============================================================
const CPK_COLORS = {
    C:  '#909090',  // Carbon - grey
    N:  '#3050F8',  // Nitrogen - blue
    O:  '#FF0D0D',  // Oxygen - red
    S:  '#FFFF30',  // Sulfur - yellow
    FE: '#E06633',  // Iron - orange
    H:  '#FFFFFF',  // Hydrogen - white (not in this dataset)
};

// ============================================================
// 2. Van der Waals Radii (angstroms)
// ============================================================
const VDW_RADII = {
    C:  1.7,
    N:  1.55,
    O:  1.52,
    S:  1.8,
    FE: 1.95,
    H:  1.2,
};

// ============================================================
// 3. Chain Colors (distinct, colorblind-friendly palette)
// ============================================================
const CHAIN_COLORS = {
    A: '#4CAF50',   // Green  - alpha-1 subunit
    B: '#2196F3',   // Blue   - beta-1 subunit
    C: '#FF9800',   // Orange - alpha-2 subunit
    D: '#E91E63',   // Pink   - beta-2 subunit
};

// ============================================================
// 4. Residue Type Colors (amino acid group coloring)
// ============================================================
const RESIDUE_COLORS = {
    // Nonpolar / hydrophobic
    ALA: '#8CFF8C', GLY: '#EBEBEB', VAL: '#8CFF8C', LEU: '#8CFF8C',
    ILE: '#8CFF8C', PRO: '#DC9682', PHE: '#BEA06E', TRP: '#BEA06E',
    MET: '#B8A042',
    // Polar / uncharged
    SER: '#FD7400', THR: '#FD7400', CYS: '#FFFF70', TYR: '#BEA06E',
    ASN: '#00DCDC', GLN: '#00DCDC',
    // Positively charged
    LYS: '#4747B8', ARG: '#4747B8', HIS: '#7070FF',
    // Negatively charged
    ASP: '#A00042', GLU: '#A00042',
    // Special
    HEM: '#CC0000',  // Heme group
    HOH: '#5090D0',  // Water
};


// ============================================================
// 5. Data Loading
// ============================================================

/**
 * Load all three protein data files.
 * Returns a Promise that resolves to { structure, chains, components }
 * or rejects with an error message.
 *
 * Usage:
 *   const data = await loadProteinData('datasets/1A3N');
 *   console.log(data.structure.vertices.length); // 4997
 */
async function loadProteinData(basePath) {
    const files = ['structure.json', 'chains.json', 'components.json'];
    const results = {};

    for (const file of files) {
        const url = `${basePath}/${file}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load ${file}: ${response.status} ${response.statusText}`);
        }
        const key = file.replace('.json', '');
        results[key] = await response.json();
    }

    console.log(`Protein data loaded: ${results.structure.vertices.length} atoms, ` +
                `${results.structure.connections.length} bonds, ` +
                `${Object.keys(results.components).length} residues, ` +
                `${Object.keys(results.chains).length} chains`);

    return results;
}


// ============================================================
// 6. InstancedMesh Atom Renderer
// ============================================================

/**
 * Create an InstancedMesh to render many spheres efficiently.
 * Instead of creating one <a-sphere> per atom (very slow for 5000 atoms),
 * this uses a single Three.js InstancedMesh draw call.
 *
 * @param {Array} atoms - Array of { position: [x,y,z], color: '#hex', radius: number }
 * @param {number} segments - Sphere detail level (default 8, lower = faster)
 * @returns {THREE.InstancedMesh} - Add to scene with: el.object3D.add(mesh)
 *
 * Usage:
 *   const atoms = vertices.map(v => ({
 *       position: v.position,
 *       color: CPK_COLORS[v.element] || '#CCCCCC',
 *       radius: (VDW_RADII[v.element] || 1.5) * 0.3  // scale down for ball-and-stick
 *   }));
 *   const mesh = createInstancedAtoms(atoms);
 *   document.getElementById('ball-stick-view').object3D.add(mesh);
 */
function createInstancedAtoms(atoms, segments = 8) {
    const geometry = new THREE.SphereGeometry(1, segments, segments);
    const material = new THREE.MeshPhongMaterial({ vertexColors: false });

    // We need per-instance colors, so use a custom approach
    const mesh = new THREE.InstancedMesh(geometry, material, atoms.length);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < atoms.length; i++) {
        const atom = atoms[i];
        dummy.position.set(atom.position[0], atom.position[1], atom.position[2]);
        dummy.scale.setScalar(atom.radius);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, color.set(atom.color));
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;

    return mesh;
}


// ============================================================
// 7. InstancedMesh Bond Renderer
// ============================================================

/**
 * Create an InstancedMesh to render bonds as cylinders.
 *
 * @param {Array} bonds - Array of { from: [x,y,z], to: [x,y,z], color: '#hex' }
 * @param {number} radius - Cylinder radius (default 0.15 angstroms)
 * @returns {THREE.InstancedMesh}
 *
 * Usage:
 *   const vertexMap = {};
 *   data.structure.vertices.forEach(v => { vertexMap[v.id] = v; });
 *   const bonds = data.structure.connections.map(c => ({
 *       from: vertexMap[c.from].position,
 *       to: vertexMap[c.to].position,
 *       color: '#666666'
 *   }));
 *   const mesh = createInstancedBonds(bonds);
 *   document.getElementById('ball-stick-view').object3D.add(mesh);
 */
function createInstancedBonds(bonds, radius = 0.15) {
    const geometry = new THREE.CylinderGeometry(radius, radius, 1, 6, 1);
    // Rotate geometry so it aligns along Y by default
    geometry.translate(0, 0.5, 0);
    geometry.rotateX(Math.PI / 2);

    const material = new THREE.MeshPhongMaterial({ vertexColors: false });
    const mesh = new THREE.InstancedMesh(geometry, material, bonds.length);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const from = new THREE.Vector3();
    const to = new THREE.Vector3();
    const direction = new THREE.Vector3();

    for (let i = 0; i < bonds.length; i++) {
        const bond = bonds[i];
        from.set(bond.from[0], bond.from[1], bond.from[2]);
        to.set(bond.to[0], bond.to[1], bond.to[2]);

        direction.subVectors(to, from);
        const length = direction.length();

        // Position at midpoint
        dummy.position.lerpVectors(from, to, 0.5);

        // Orient along the bond direction
        dummy.lookAt(to);

        // Scale: radius is baked in geometry, length along Z
        dummy.scale.set(1, 1, length);

        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, color.set(bond.color || '#666666'));
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;

    return mesh;
}


// ============================================================
// 8. Catmull-Rom Spline (for ribbon visualization)
// ============================================================

/**
 * Generate a smooth Catmull-Rom spline curve through control points.
 * Useful for Task 5 ribbon visualization.
 *
 * @param {Array} points - Array of [x, y, z] control points
 * @param {number} subdivisions - Points to generate between each control point (default 10)
 * @returns {Array} - Array of [x, y, z] interpolated points
 *
 * Usage:
 *   const caAtoms = extractBackbone(data, 'A');
 *   const splinePoints = catmullRomSpline(caAtoms, 10);
 *   // Use splinePoints to create a TubeGeometry or line
 */
function catmullRomSpline(points, subdivisions = 10) {
    if (points.length < 2) return points;

    const result = [];
    const tension = 0.5;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        for (let t = 0; t < subdivisions; t++) {
            const s = t / subdivisions;
            const s2 = s * s;
            const s3 = s2 * s;

            const x = 0.5 * (
                (2 * p1[0]) +
                (-p0[0] + p2[0]) * s +
                (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * s2 +
                (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * s3
            );
            const y = 0.5 * (
                (2 * p1[1]) +
                (-p0[1] + p2[1]) * s +
                (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * s2 +
                (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * s3
            );
            const z = 0.5 * (
                (2 * p1[2]) +
                (-p0[2] + p2[2]) * s +
                (2 * p0[2] - 5 * p1[2] + 4 * p2[2] - p3[2]) * s2 +
                (-p0[2] + 3 * p1[2] - 3 * p2[2] + p3[2]) * s3
            );

            result.push([x, y, z]);
        }
    }

    // Add the last point
    result.push(points[points.length - 1]);
    return result;
}


// ============================================================
// 9. Backbone Extraction (for ribbon visualization)
// ============================================================

/**
 * Extract C-alpha atom positions for a given chain.
 * C-alpha atoms are the second atom in each amino acid residue
 * (index 1 within the component's atoms array) and have element 'C'.
 *
 * This is a simplified extraction - in a real PDB parser you'd
 * look for the atom name 'CA', but our JSON doesn't include atom names.
 * Instead we take the second atom of each non-HOH, non-HEM component,
 * which corresponds to the C-alpha in standard amino acid PDB ordering.
 *
 * @param {Object} data - The loaded protein data { structure, chains, components }
 * @param {string} chainId - Chain ID ('A', 'B', 'C', or 'D')
 * @returns {Array} - Array of [x, y, z] positions for C-alpha atoms
 */
function extractBackbone(data, chainId) {
    const vertexMap = {};
    data.structure.vertices.forEach(v => { vertexMap[v.id] = v; });

    const caPositions = [];

    // Get components for this chain, sorted by residue number
    const chainComponents = Object.entries(data.components)
        .filter(([key, comp]) => comp.chain === chainId && comp.type !== 'HOH' && comp.type !== 'HEM')
        .sort((a, b) => {
            const numA = parseInt(a[0].split('_')[1]);
            const numB = parseInt(b[0].split('_')[1]);
            return numA - numB;
        });

    for (const [key, comp] of chainComponents) {
        // Second atom in standard PDB amino acid ordering is C-alpha
        if (comp.atoms.length >= 2) {
            const caAtom = vertexMap[comp.atoms[1]];
            if (caAtom) {
                caPositions.push(caAtom.position);
            }
        }
    }

    return caPositions;
}


// ============================================================
// Helper: Convert hex color string to THREE.Color
// ============================================================
function hexToThreeColor(hex) {
    return new THREE.Color(hex);
}

/**
 * Compute the centroid (average position) of an array of positions.
 * @param {Array} positions - Array of [x, y, z]
 * @returns {Array} [cx, cy, cz]
 */
function computeCentroid(positions) {
    const sum = [0, 0, 0];
    for (const p of positions) {
        sum[0] += p[0];
        sum[1] += p[1];
        sum[2] += p[2];
    }
    return [sum[0] / positions.length, sum[1] / positions.length, sum[2] / positions.length];
}
