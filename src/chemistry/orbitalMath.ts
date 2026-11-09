import * as THREE from 'three';

/**
 * Mathematical and physical constants & vectors for sp3 hybridization
 */

// Tetrahedral unit vectors: vertices of regular tetrahedron centered at origin
// In cube [-1, 1]^3: (1,1,1), (-1,-1,1), (-1,1,-1), (1,-1,-1) normalized
const invSqrt3 = 1 / Math.sqrt(3);

export const TETRAHEDRAL_VECTORS: THREE.Vector3[] = [
  new THREE.Vector3(1, 1, 1).multiplyScalar(invSqrt3),
  new THREE.Vector3(-1, -1, 1).multiplyScalar(invSqrt3),
  new THREE.Vector3(-1, 1, -1).multiplyScalar(invSqrt3),
  new THREE.Vector3(1, -1, -1).multiplyScalar(invSqrt3),
];

// Exact tetrahedral angle in degrees and radians
export const TETRAHEDRAL_ANGLE_DEG = 109.4712; // ~109.5°
export const TETRAHEDRAL_ANGLE_RAD = Math.acos(-1 / 3);

// Colors for orbital representations (scientifically distinguished)
export const ORBITAL_COLORS = {
  nucleus: 0x334155, // Carbon core
  nucleusEmissive: 0x0ea5e9,
  electron1s: 0x64748b, // Inner shell
  sOrbital: 0x38bdf8, // 2s: Sky Blue
  pxOrbitalPos: 0xf43f5e, // 2px: Rose/Coral (+)
  pxOrbitalNeg: 0xfb7185, // 2px: Rose (-)
  pyOrbitalPos: 0x10b981, // 2py: Emerald (+)
  pyOrbitalNeg: 0x34d399, // 2py: Emerald (-)
  pzOrbitalPos: 0xa855f7, // 2pz: Purple (+)
  pzOrbitalNeg: 0xc084fc, // 2pz: Purple (-)
  sp3Major: 0x06b6d4, // sp3 major lobe: Cyan / Teal
  sp3Minor: 0xf59e0b, // sp3 minor tail lobe: Amber
  hydrogen: 0xf8fafc, // Hydrogen atom: White
  hydrogenOrbital: 0x93c5fd, // H 1s cloud: Soft Ice Blue
  sigmaBond: 0x3b82f6, // C-H sigma bond electron cloud: Bright Electric Blue
  tetrahedronWire: 0xe2e8f0, // Tetrahedral geometric cage
  angleArc: 0xfacc15, // 109.5° angle arc: Vivid Gold
};

/**
 * Computes a quaternion rotation that aligns the local +Z (or +Y) axis to a target vector
 */
export function getRotationToVector(target: THREE.Vector3, upAxis = new THREE.Vector3(0, 0, 1)): THREE.Quaternion {
  const quat = new THREE.Quaternion();
  quat.setFromUnitVectors(upAxis, target.clone().normalize());
  return quat;
}

/**
 * Generate points along a circular arc between two unit vectors around origin
 */
export function createArcPoints(
  v1: THREE.Vector3,
  v2: THREE.Vector3,
  radius: number,
  segments: number = 32
): THREE.Vector3[] {
  const u1 = v1.clone().normalize();
  const u2 = v2.clone().normalize();
  const axis = new THREE.Vector3().crossVectors(u1, u2).normalize();
  const angle = Math.acos(Math.max(-1, Math.min(1, u1.dot(u2))));

  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const currentAngle = angle * t;
    const pt = u1.clone().applyAxisAngle(axis, currentAngle).multiplyScalar(radius);
    points.push(pt);
  }
  return points;
}
