import * as THREE from 'three';

/**
 * Mathematical constants & vectors for the Ethane (C2H6) sp3 simulation
 */

// Central C-C bond axis lies along X
// For Carbon A (left, centered at -d/2):
// Lobe 1 points towards Carbon B: (+1, 0, 0)
// Lobes 2, 3, 4 form a tetrahedral tripod pointing backwards (-X)
const cosTet = -1 / 3; // cos(109.47°)
const sinTet = Math.sqrt(1 - cosTet * cosTet); // 2*sqrt(2)/3 ≈ 0.9428

export const ETHANE_CA_VECTORS: THREE.Vector3[] = [
  new THREE.Vector3(1, 0, 0), // points toward CB (C-C sigma bond)
  new THREE.Vector3(cosTet, sinTet * Math.cos(0), sinTet * Math.sin(0)),
  new THREE.Vector3(cosTet, sinTet * Math.cos((2 * Math.PI) / 3), sinTet * Math.sin((2 * Math.PI) / 3)),
  new THREE.Vector3(cosTet, sinTet * Math.cos((4 * Math.PI) / 3), sinTet * Math.sin((4 * Math.PI) / 3)),
];

// For Carbon B (right, centered at +d/2):
// Lobe 1 points toward Carbon A: (-1, 0, 0)
// Lobes 2, 3, 4 point forwards (+X) in staggered (60° offset) conformation
export const ETHANE_CB_VECTORS: THREE.Vector3[] = [
  new THREE.Vector3(-1, 0, 0), // points toward CA (C-C sigma bond)
  new THREE.Vector3(-cosTet, sinTet * Math.cos(Math.PI / 3), sinTet * Math.sin(Math.PI / 3)),
  new THREE.Vector3(-cosTet, sinTet * Math.cos(Math.PI), sinTet * Math.sin(Math.PI)),
  new THREE.Vector3(-cosTet, sinTet * Math.cos((5 * Math.PI) / 3), sinTet * Math.sin((5 * Math.PI) / 3)),
];

/**
 * Returns directional vectors for Carbon B with an arbitrary rotation angle around the C-C axis
 * Demonstrating the textbook free rotation (szabad rotáció / konformáció)
 */
export function getRotatedEthaneVectors(angleRad: number): THREE.Vector3[] {
  return [
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(-cosTet, sinTet * Math.cos(Math.PI / 3 + angleRad), sinTet * Math.sin(Math.PI / 3 + angleRad)),
    new THREE.Vector3(-cosTet, sinTet * Math.cos(Math.PI + angleRad), sinTet * Math.sin(Math.PI + angleRad)),
    new THREE.Vector3(-cosTet, sinTet * Math.cos((5 * Math.PI) / 3 + angleRad), sinTet * Math.sin((5 * Math.PI) / 3 + angleRad)),
  ];
}
