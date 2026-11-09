import * as THREE from 'three';

/**
 * Procedural BufferGeometry generators for scientific atomic and molecular orbitals
 */

/**
 * Creates a smooth spherical orbital (e.g. 1s or 2s)
 */
export function createSphereOrbitalGeometry(radius: number, widthSegments = 40, heightSegments = 30): THREE.BufferGeometry {
  return new THREE.SphereGeometry(radius, widthSegments, heightSegments);
}

/**
 * Creates a single lobe of an elongated figure-8 (dumbbell) orbital pointing along +Z.
 * The apex at z = L is a completely smooth, rounded dome (like an egg/capsule),
 * NOT pointed or pinched, creating an authentic elongated figure-8 shape.
 */
export function createFigure8LobeGeometry(
  length: number,
  maxRadius: number,
  radialSegments = 36,
  heightSegments = 28
): THREE.BufferGeometry {
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let yIndex = 0; yIndex <= heightSegments; yIndex++) {
    // phi goes from 0 (at origin/nucleus) to PI (at the outer rounded dome apex)
    const t = yIndex / heightSegments; // 0 to 1
    const phi = t * Math.PI;

    // Smooth shifted ellipsoidal Z: z(0) = 0, z(PI) = length
    const z = (length / 2) * (1 - Math.cos(phi));

    // Profile radius: rounded dome at the tip (phi = PI), slender waist at nucleus (phi = 0)
    // sin(phi) gives circular curvature at apex, factor (0.35 + 0.65 * sin(phi/2)) shapes the dumbbell waist
    const profile = Math.sin(phi) * (0.35 + 0.65 * Math.sin(phi / 2));
    const r = Math.max(0, maxRadius * profile);

    for (let xIndex = 0; xIndex <= radialSegments; xIndex++) {
      const u = xIndex / radialSegments;
      const angle = u * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const x = r * cosA;
      const y = r * sinA;

      vertices.push(x, y, z);
      uvs.push(u, t);
    }
  }

  const ringVertices = radialSegments + 1;
  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < radialSegments; x++) {
      const i0 = y * ringVertices + x;
      const i1 = i0 + 1;
      const i2 = (y + 1) * ringVertices + x;
      const i3 = i2 + 1;

      indices.push(i0, i1, i2);
      indices.push(i1, i3, i2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates an asymmetric sp3 hybrid orbital geometry pointing along +Z.
 * Both major and minor lobes have smooth rounded dome tips (never pointy).
 */
export function createSp3HybridGeometry(
  majorLength = 2.65,
  majorRadius = 1.25,
  minorLength = 0.8,
  minorRadius = 0.5,
  radialSegments = 36,
  heightSegments = 30
): { majorGeo: THREE.BufferGeometry; minorGeo: THREE.BufferGeometry } {
  // Major lobe with rounded dome tip along +Z
  const majorGeo = createFigure8LobeGeometry(majorLength, majorRadius, radialSegments, heightSegments);
  
  // Minor back lobe with rounded dome tip along -Z
  const minorGeo = createFigure8LobeGeometry(minorLength, minorRadius, radialSegments, heightSegments);
  minorGeo.rotateX(Math.PI); // rotate 180° so it extends along -Z

  return { majorGeo, minorGeo };
}

/**
 * Creates a prolate sigma bonding cloud geometry along Z
 */
export function createSigmaBondCloudGeometry(
  length = 2.0,
  radius = 0.72,
  radialSegments = 28,
  heightSegments = 20
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(radius, radialSegments, heightSegments);
  geo.scale(1, 1, length / (radius * 2));
  return geo;
}

/**
 * Creates lines connecting vertices of a tetrahedron
 */
export function createTetrahedronFrameLines(
  vertices: THREE.Vector3[],
  radiusScale: number = 2.6
): THREE.BufferGeometry {
  const pts = vertices.map(v => v.clone().multiplyScalar(radiusScale));
  const linePoints: THREE.Vector3[] = [];

  const edges = [
    [0, 1], [0, 2], [0, 3],
    [1, 2], [1, 3], [2, 3]
  ];

  edges.forEach(([i, j]) => {
    linePoints.push(pts[i], pts[j]);
  });

  const geo = new THREE.BufferGeometry().setFromPoints(linePoints);
  return geo;
}

/**
 * Creates semi-transparent faces of the tetrahedron
 */
export function createTetrahedronFacesGeometry(
  vertices: THREE.Vector3[],
  radiusScale: number = 2.6
): THREE.BufferGeometry {
  const pts = vertices.map(v => v.clone().multiplyScalar(radiusScale));
  
  const triangles = [
    [0, 1, 2],
    [0, 2, 3],
    [0, 3, 1],
    [1, 3, 2]
  ];

  const positions: number[] = [];
  triangles.forEach(([a, b, c]) => {
    positions.push(pts[a].x, pts[a].y, pts[a].z);
    positions.push(pts[b].x, pts[b].y, pts[b].z);
    positions.push(pts[c].x, pts[c].y, pts[c].z);
    // Double sided
    positions.push(pts[a].x, pts[a].y, pts[a].z);
    positions.push(pts[c].x, pts[c].y, pts[c].z);
    positions.push(pts[b].x, pts[b].y, pts[b].z);
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}
