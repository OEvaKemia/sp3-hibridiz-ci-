import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  TETRAHEDRAL_VECTORS,
  ORBITAL_COLORS,
  getRotationToVector,
  createArcPoints,
} from '../chemistry/orbitalMath';
import {
  createSphereOrbitalGeometry,
  createFigure8LobeGeometry,
  createSp3HybridGeometry,
  createSigmaBondCloudGeometry,
  createTetrahedronFrameLines,
  createTetrahedronFacesGeometry,
} from '../chemistry/orbitalGeometries';

export interface SceneToggles {
  showTetrahedronFrame: boolean;
  showAngleArc: boolean;
  showElectrons: boolean;
  showAxes: boolean;
  showMinorLobes: boolean;
  autoRotate: boolean;
  modelStyle: 'orbitals' | 'ballAndStick' | 'spaceFilling';
  viewMode: 'sideBySide' | 'single';
}

interface ChemistrySceneProps {
  currentTime: number;
  toggles: SceneToggles;
  isProjectorMode: boolean;
  canvasRefCallback?: (canvas: HTMLCanvasElement | null) => void;
  onCameraChange?: () => void;
}

/**
 * Creates a high-visibility, ultra-prominent electron with bright glowing core,
 * saturated halo, and wavepacket ring so it is unmistakably visible on classroom projectors.
 */
function createStrongElectron(
  emissiveColor: number,
  haloColor: number,
  baseScale: number = 1.0
): THREE.Group {
  const group = new THREE.Group();

  // 1. Brilliant white-hot inner core with intense emission
  const coreGeo = new THREE.SphereGeometry(0.14 * baseScale, 20, 20);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: emissiveColor,
    emissiveIntensity: 3.5,
    roughness: 0.1,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  group.add(coreMesh);

  // 2. High-saturation glowing halo sphere
  const haloGeo = new THREE.SphereGeometry(0.26 * baseScale, 20, 20);
  const haloMat = new THREE.MeshBasicMaterial({
    color: haloColor,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  group.add(haloMesh);

  // 3. Subtle outer quantum probability ring
  const ringGeo = new THREE.RingGeometry(0.18 * baseScale, 0.28 * baseScale, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: emissiveColor,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  group.add(ringMesh);

  return group;
}

/**
 * Creates high-DPI canvas texture for labels and electron box billboards
 */
function createTextSprite(
  text: string,
  bgColor: string = 'rgba(15, 23, 42, 0.85)',
  textColor: string = '#38bdf8',
  borderColor: string = '#0284c7',
  fontSize: number = 26
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 120;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const x = 12;
  const y = 16;
  const w = canvas.width - 24;
  const h = canvas.height - 32;
  const r = 16;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  ctx.font = `bold ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;

  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.6, 0.6, 1);
  return sprite;
}

/**
 * Creates a specialized electron-box billboard sprite showing [ OrbitalName   Arrows ]
 */
function createElectronBoxSprite(
  orbitalName: string,
  arrowText: string,
  themeColor: string = '#38bdf8',
  subText: string = ''
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 140;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background card
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = themeColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 14);
  ctx.fill();
  ctx.stroke();

  // Orbital name tag
  ctx.font = `bold 22px 'JetBrains Mono', monospace`;
  ctx.fillStyle = themeColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(orbitalName, 26, 45);

  // Box with electron arrow(s)
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.strokeRect(canvas.width - 100, 22, 74, 46);

  ctx.font = `bold 26px system-ui, sans-serif`;
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'center';
  ctx.fillText(arrowText, canvas.width - 63, 45);

  // Subtext descriptor
  if (subText) {
    ctx.font = `15px 'Plus Jakarta Sans', sans-serif`;
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText(subText, canvas.width / 2, 98);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;

  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.5, 0.7, 1);
  return sprite;
}

export const ChemistryScene: React.FC<ChemistrySceneProps> = ({
  currentTime,
  toggles,
  isProjectorMode,
  canvasRefCallback,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<number>(currentTime);
  const togglesRef = useRef<SceneToggles>(toggles);
  const projectorModeRef = useRef<boolean>(isProjectorMode);

  timeRef.current = currentTime;
  togglesRef.current = toggles;
  projectorModeRef.current = isProjectorMode;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isProjectorMode ? 0xf8fafc : 0x020617);

    // Camera setup - wider view to accommodate side-by-side mode and all HUD elements nicely
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 14.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isProjectorMode ? 1.05 : 1.25;

    container.appendChild(renderer.domElement);
    if (canvasRefCallback) {
      canvasRefCallback(renderer.domElement);
    }

    // Studio Environment lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio 3-point light rig
    const ambientLight = new THREE.AmbientLight(0xffffff, isProjectorMode ? 1.1 : 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(6, 9, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fillLight.position.set(-8, -2, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.2);
    rimLight.position.set(0, -6, 6);
    scene.add(rimLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 28.0;

    const nucleusGeo = new THREE.SphereGeometry(0.32, 28, 20);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
      roughness: 0.25,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
    });

    // =========================================================================
    // 1. SEPARATED INITIAL ATOMIC ORBITALS (KEZDETI ÁLLAPOT)
    // Left side: placed around X ≈ -4.8, showing 2s sphere and three 2p dumbbells
    // each with its own electron box [ 2s ↑↓ ] [ 2px ↑ ] [ 2py ↑ ] [ 2pz ↑ / ∅ ]
    // =========================================================================
    const initialGroup = new THREE.Group();
    initialGroup.position.set(-4.8, 0, 0);

    const initialTitleSprite = createTextSprite(
      'KEZDETI ÁLLAPOT: 1 db 2s + 3 db 2p pálya',
      'rgba(14,165,233,0.3)',
      '#e0f2fe',
      '#0284c7',
      24
    );
    initialTitleSprite.position.set(0, 3.4, 0);
    initialTitleSprite.scale.set(2.4, 0.6, 1);
    initialGroup.add(initialTitleSprite);

    // 2s Orbital (Spherical, Top-Left at X=-1.8, Y=1.4)
    const s2Group = new THREE.Group();
    s2Group.position.set(-1.8, 1.3, 0);
    const s2Mesh = new THREE.Mesh(
      createSphereOrbitalGeometry(1.05, 32, 24),
      new THREE.MeshPhysicalMaterial({
        color: ORBITAL_COLORS.sOrbital,
        transparent: true,
        opacity: 0.45,
        roughness: 0.2,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    s2Group.add(s2Mesh);
    s2Group.add(new THREE.Mesh(nucleusGeo, nucleusMat));

    // 2s electrons: radiant electric amber-gold with glowing halos
    const s2ElA = createStrongElectron(0xfacc15, 0xf59e0b);
    const s2ElB = createStrongElectron(0xfacc15, 0xf59e0b);
    s2Group.add(s2ElA, s2ElB);

    const s2BoxNormal = createElectronBoxSprite('2s', '↑↓', '#38bdf8', 'gömb pálya');
    s2BoxNormal.position.set(0, 1.45, 0);
    const s2BoxExcited = createElectronBoxSprite('2s', '↑', '#38bdf8', '1 db elektron maradt');
    s2BoxExcited.position.set(0, 1.45, 0);
    s2BoxExcited.visible = false;
    s2Group.add(s2BoxNormal, s2BoxExcited);
    initialGroup.add(s2Group);

    // 2px Orbital (Elongated figure-8 along X, Top-Right at X=+1.8, Y=1.4)
    // Smooth rounded dome ends, never pointy
    const pxGroup = new THREE.Group();
    pxGroup.position.set(1.8, 1.3, 0);
    const pxPosGeo = createFigure8LobeGeometry(1.35, 0.68);
    const pxNegGeo = createFigure8LobeGeometry(1.35, 0.68);
    pxNegGeo.rotateX(Math.PI);
    const pxMeshPos = new THREE.Mesh(
      pxPosGeo,
      new THREE.MeshPhysicalMaterial({
        color: ORBITAL_COLORS.pxOrbitalPos,
        transparent: true,
        opacity: 0.52,
        roughness: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const pxMeshNeg = new THREE.Mesh(
      pxNegGeo,
      new THREE.MeshPhysicalMaterial({
        color: ORBITAL_COLORS.pxOrbitalNeg,
        transparent: true,
        opacity: 0.52,
        roughness: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const pxSub = new THREE.Group();
    pxSub.rotation.y = Math.PI / 2; // align along X
    pxSub.add(pxMeshPos, pxMeshNeg);
    pxGroup.add(pxSub);
    pxGroup.add(new THREE.Mesh(nucleusGeo, nucleusMat));

    // 2px electron: radiant neon coral-red
    const pxEl = createStrongElectron(0xff0055, 0xf43f5e);
    pxSub.add(pxEl);

    const pxBox = createElectronBoxSprite('2pₓ', '↑', '#f43f5e', 'elnyújtott 8-as (X)');
    pxBox.position.set(0, 1.45, 0);
    pxGroup.add(pxBox);
    initialGroup.add(pxGroup);

    // 2py Orbital (Elongated figure-8 along Y, Bottom-Left at X=-1.8, Y=-1.7)
    // Smooth rounded dome ends, never pointy
    const pyGroup = new THREE.Group();
    pyGroup.position.set(-1.8, -1.7, 0);
    const pyPosGeo = createFigure8LobeGeometry(1.35, 0.68);
    const pyNegGeo = createFigure8LobeGeometry(1.35, 0.68);
    pyNegGeo.rotateX(Math.PI);
    const pyMeshPos = new THREE.Mesh(
      pyPosGeo,
      new THREE.MeshPhysicalMaterial({
        color: ORBITAL_COLORS.pyOrbitalPos,
        transparent: true,
        opacity: 0.52,
        roughness: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const pyMeshNeg = new THREE.Mesh(
      pyNegGeo,
      new THREE.MeshPhysicalMaterial({
        color: ORBITAL_COLORS.pyOrbitalNeg,
        transparent: true,
        opacity: 0.52,
        roughness: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const pySub = new THREE.Group();
    pySub.rotation.x = -Math.PI / 2; // align along Y
    pySub.add(pyMeshPos, pyMeshNeg);
    pyGroup.add(pySub);
    pyGroup.add(new THREE.Mesh(nucleusGeo, nucleusMat));

    // 2py electron: radiant neon emerald-green
    const pyEl = createStrongElectron(0x00ff88, 0x10b981);
    pySub.add(pyEl);

    const pyBox = createElectronBoxSprite('2pᵧ', '↑', '#10b981', 'elnyújtott 8-as (Y)');
    pyBox.position.set(0, 1.45, 0);
    pyGroup.add(pyBox);
    initialGroup.add(pyGroup);

    // 2pz Orbital (Elongated figure-8 along Z, Bottom-Right at X=+1.8, Y=-1.7)
    // Smooth rounded dome ends, never pointy
    const pzGroup = new THREE.Group();
    pzGroup.position.set(1.8, -1.7, 0);
    const pzPosGeo = createFigure8LobeGeometry(1.35, 0.68);
    const pzNegGeo = createFigure8LobeGeometry(1.35, 0.68);
    pzNegGeo.rotateX(Math.PI);
    const pzMatPos = new THREE.MeshPhysicalMaterial({
      color: ORBITAL_COLORS.pzOrbitalPos,
      transparent: true,
      opacity: 0.2, // starts empty
      roughness: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const pzMatNeg = new THREE.MeshPhysicalMaterial({
      color: ORBITAL_COLORS.pzOrbitalNeg,
      transparent: true,
      opacity: 0.2,
      roughness: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const pzMeshPos = new THREE.Mesh(pzPosGeo, pzMatPos);
    const pzMeshNeg = new THREE.Mesh(pzNegGeo, pzMatNeg);
    const pzSub = new THREE.Group();
    pzSub.rotation.y = Math.PI / 6;
    pzSub.rotation.x = Math.PI / 8;
    pzSub.add(pzMeshPos, pzMeshNeg);
    pzGroup.add(pzSub);
    pzGroup.add(new THREE.Mesh(nucleusGeo, nucleusMat));

    // 2pz electron: radiant neon violet
    const pzEl = createStrongElectron(0xd946ef, 0xa855f7);
    pzEl.visible = false;
    pzSub.add(pzEl);

    const pzBoxEmpty = createElectronBoxSprite('2p_z', '∅', '#a855f7', 'üres (Hund-szabály)');
    pzBoxEmpty.position.set(0, 1.45, 0);
    const pzBoxExcited = createElectronBoxSprite('2p_z', '↑', '#a855f7', '1 db elektron (C*)');
    pzBoxExcited.position.set(0, 1.45, 0);
    pzBoxExcited.visible = false;
    pzGroup.add(pzBoxEmpty, pzBoxExcited);
    initialGroup.add(pzGroup);

    // Excitation particle travelling from 2s to 2pz: blazing golden burst
    const initialExciteParticle = createStrongElectron(0xffd700, 0xff8800, 1.25);
    initialExciteParticle.visible = false;
    initialGroup.add(initialExciteParticle);

    scene.add(initialGroup);

    // =========================================================================
    // 2. CENTER TRANSITION BRIDGE: 1 db 2s + 3 db 2p ⟶ 4 db sp³
    // Positioned at X ≈ 0
    // =========================================================================
    const centerBridgeGroup = new THREE.Group();
    centerBridgeGroup.position.set(0, 0, 0);

    const arrowCanvas = document.createElement('canvas');
    arrowCanvas.width = 380;
    arrowCanvas.height = 140;
    const aCtx = arrowCanvas.getContext('2d')!;
    aCtx.clearRect(0, 0, arrowCanvas.width, arrowCanvas.height);
    // Draw glowing forward arrow
    aCtx.fillStyle = 'rgba(6, 182, 212, 0.2)';
    aCtx.strokeStyle = '#06b6d4';
    aCtx.lineWidth = 3;
    aCtx.beginPath();
    aCtx.roundRect(10, 10, arrowCanvas.width - 20, arrowCanvas.height - 20, 16);
    aCtx.fill();
    aCtx.stroke();

    aCtx.font = `bold 22px 'Plus Jakarta Sans', sans-serif`;
    aCtx.fillStyle = '#38bdf8';
    aCtx.textAlign = 'center';
    aCtx.fillText('HIBRIDIZÁCIÓ', arrowCanvas.width / 2, 45);

    aCtx.font = `bold 28px system-ui, sans-serif`;
    aCtx.fillStyle = '#22d3ee';
    aCtx.fillText('s + 3p ⟹ 4 × sp³', arrowCanvas.width / 2, 85);

    aCtx.font = `14px 'Plus Jakarta Sans', sans-serif`;
    aCtx.fillStyle = '#94a3b8';
    aCtx.fillText('egyenkénti kialakulás', arrowCanvas.width / 2, 115);

    const arrowTex = new THREE.CanvasTexture(arrowCanvas);
    arrowTex.colorSpace = THREE.SRGBColorSpace;
    const arrowSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: arrowTex, transparent: true, depthTest: false })
    );
    arrowSprite.position.set(0, 0, 0);
    arrowSprite.scale.set(2.2, 0.9, 1);
    centerBridgeGroup.add(arrowSprite);
    scene.add(centerBridgeGroup);

    // =========================================================================
    // 3. FINAL HYBRIDIZED STATE & METHANE (VÉGSŐ ÁLLAPOT)
    // Right side: placed around X ≈ +4.8
    // Contains the 4 sp3 hybrid orbitals forming ONE-BY-ONE, with overhead
    // electron boxes [ sp³ #1 ↑ ], [ sp³ #2 ↑ ], [ sp³ #3 ↑ ], [ sp³ #4 ↑ ]
    // =========================================================================
    const finalGroup = new THREE.Group();
    finalGroup.position.set(4.8, 0, 0);

    const finalTitleSprite = createTextSprite(
      'VÉGSŐ ÁLLAPOT: 4 db sp³ hibridpálya',
      'rgba(6,182,212,0.3)',
      '#a5f3fc',
      '#06b6d4',
      24
    );
    finalTitleSprite.position.set(0, 3.4, 0);
    finalTitleSprite.scale.set(2.4, 0.6, 1);
    finalGroup.add(finalTitleSprite);

    // Central Carbon Nucleus of final system
    const finalNucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    finalGroup.add(finalNucleus);

    // 4 sp3 hybrid orbital assemblies that emerge ONE BY ONE
    const sp3Objects: {
      group: THREE.Group;
      majorMesh: THREE.Mesh;
      minorMesh: THREE.Mesh;
      elMesh: THREE.Group;
      majorMat: THREE.MeshPhysicalMaterial;
      minorMat: THREE.MeshPhysicalMaterial;
      boxSprite: THREE.Sprite;
      vector: THREE.Vector3;
    }[] = [];

    // Major and minor lobes with smooth rounded dome tips
    const { majorGeo, minorGeo } = createSp3HybridGeometry(2.45, 1.15, 0.75, 0.45);

    TETRAHEDRAL_VECTORS.forEach((vector, i) => {
      const sp3Item = new THREE.Group();
      sp3Item.quaternion.copy(getRotationToVector(vector));

      const majorMat = new THREE.MeshPhysicalMaterial({
        color: ORBITAL_COLORS.sp3Major,
        transparent: true,
        opacity: 0.48,
        roughness: 0.25,
        clearcoat: 0.4,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const minorMat = new THREE.MeshPhysicalMaterial({
        color: ORBITAL_COLORS.sp3Minor,
        transparent: true,
        opacity: 0.45,
        roughness: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const majorMesh = new THREE.Mesh(majorGeo, majorMat);
      const minorMesh = new THREE.Mesh(minorGeo, minorMat);
      sp3Item.add(majorMesh, minorMesh);

      // Valence electron inside major lobe: intense electric cyan
      const elMesh = createStrongElectron(0x00f5ff, 0x06b6d4);
      elMesh.position.set(0, 0, 1.45);
      sp3Item.add(elMesh);

      // Overhead electron box [ sp³ #i  ↑ ]
      const boxSprite = createElectronBoxSprite(
        `sp³ #${i + 1}`,
        '↑',
        '#06b6d4',
        'aszimmetrikus pálya'
      );
      const tipPos = vector.clone().multiplyScalar(2.6);
      boxSprite.position.set(tipPos.x, tipPos.y + 0.35, tipPos.z);
      boxSprite.scale.set(1.1, 0.52, 1);
      finalGroup.add(boxSprite);

      finalGroup.add(sp3Item);

      sp3Objects.push({
        group: sp3Item,
        majorMesh,
        minorMesh,
        elMesh,
        majorMat,
        minorMat,
        boxSprite,
        vector,
      });
    });

    // Tetrahedral frame & angle arc for final system
    const tetraFrameGeo = createTetrahedronFrameLines(TETRAHEDRAL_VECTORS, 2.45);
    const tetraLines = new THREE.LineSegments(
      tetraFrameGeo,
      new THREE.LineDashedMaterial({ color: 0xfacc15, dashSize: 0.2, gapSize: 0.1, linewidth: 2 })
    );
    tetraLines.computeLineDistances();
    finalGroup.add(tetraLines);

    const tetraFacesGeo = createTetrahedronFacesGeometry(TETRAHEDRAL_VECTORS, 2.45);
    const tetraFaces = new THREE.Mesh(
      tetraFacesGeo,
      new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false })
    );
    finalGroup.add(tetraFaces);

    // 109.5° Angle Arc
    const arcRadius = 1.35;
    const arcPts = createArcPoints(TETRAHEDRAL_VECTORS[0], TETRAHEDRAL_VECTORS[1], arcRadius, 36);
    const arcLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(arcPts),
      new THREE.LineBasicMaterial({ color: ORBITAL_COLORS.angleArc, linewidth: 3 })
    );
    finalGroup.add(arcLine);

    const arcMidPoint = TETRAHEDRAL_VECTORS[0]
      .clone()
      .add(TETRAHEDRAL_VECTORS[1])
      .normalize()
      .multiplyScalar(arcRadius + 0.35);
    const angleLabel = createTextSprite('109,5°', 'rgba(250,204,21,0.35)', '#fef08a', '#facc15', 26);
    angleLabel.position.copy(arcMidPoint);
    finalGroup.add(angleLabel);

    // Methane Hydrogens & Sigma bonds
    const methaneGroup = new THREE.Group();
    const hAtoms: {
      nucleus: THREE.Mesh;
      cloud: THREE.Mesh;
      electron: THREE.Group;
      sigmaCloud: THREE.Mesh;
      sigmaMat: THREE.MeshPhysicalMaterial;
      bondStick: THREE.Mesh;
    }[] = [];

    const hNucleusGeo = new THREE.SphereGeometry(0.22, 24, 20);
    const hNucleusMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.2,
      metalness: 0.5,
      emissive: 0xffffff,
      emissiveIntensity: 0.3,
    });
    const hCloudGeo = new THREE.SphereGeometry(0.68, 24, 20);
    const sigmaCloudGeo = createSigmaBondCloudGeometry(1.6, 0.62);
    const bondStickGeo = new THREE.CylinderGeometry(0.07, 0.07, 2.0, 16);

    TETRAHEDRAL_VECTORS.forEach((vector) => {
      const hNuc = new THREE.Mesh(hNucleusGeo, hNucleusMat);
      const hCloud = new THREE.Mesh(
        hCloudGeo,
        new THREE.MeshPhysicalMaterial({
          color: ORBITAL_COLORS.hydrogenOrbital,
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      // Hydrogen electron: radiant electric ice-blue
      const hEl = createStrongElectron(0x60a5fa, 0x3b82f6);

      const sigmaMat = new THREE.MeshPhysicalMaterial({
        color: ORBITAL_COLORS.sigmaBond,
        transparent: true,
        opacity: 0.55,
        clearcoat: 0.4,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const sigmaCloud = new THREE.Mesh(sigmaCloudGeo, sigmaMat);
      sigmaCloud.quaternion.copy(getRotationToVector(vector));

      const bondStick = new THREE.Mesh(
        bondStickGeo,
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.4, roughness: 0.3 })
      );
      bondStick.quaternion.copy(getRotationToVector(vector, new THREE.Vector3(0, 1, 0)));

      methaneGroup.add(hNuc, hCloud, hEl, sigmaCloud, bondStick);
      hAtoms.push({ nucleus: hNuc, cloud: hCloud, electron: hEl, sigmaCloud, sigmaMat, bondStick });
    });

    finalGroup.add(methaneGroup);
    scene.add(finalGroup);

    // =========================================================================
    // ANIMATION RENDER LOOP
    // =========================================================================
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const t = timeRef.current;
      const curToggles = togglesRef.current;
      const proj = projectorModeRef.current;

      scene.background = new THREE.Color(proj ? 0xf1f5f9 : 0x020617);
      renderer.toneMappingExposure = proj ? 1.05 : 1.25;

      // Rotate electron probability rings for quantum visual flair
      const pulseRate = t * 4;
      const haloScale = 1 + Math.sin(pulseRate) * 0.08;

      [s2ElA, s2ElB, pxEl, pyEl, pzEl, initialExciteParticle].forEach((elGroup) => {
        if (elGroup.children[2]) {
          elGroup.children[2].rotation.z += delta * 2.5;
        }
        if (elGroup.children[1]) {
          elGroup.children[1].scale.set(haloScale, haloScale, haloScale);
        }
      });

      sp3Objects.forEach((obj) => {
        if (obj.elMesh.children[2]) {
          obj.elMesh.children[2].rotation.z += delta * 2.5;
        }
        if (obj.elMesh.children[1]) {
          obj.elMesh.children[1].scale.set(haloScale, haloScale, haloScale);
        }
      });

      // Handle View Mode: Side-by-Side vs Focused Single Atom
      if (curToggles.viewMode === 'single') {
        initialGroup.position.set(0, 0, 0);
        finalGroup.position.set(0, 0, 0);
        centerBridgeGroup.visible = false;
        initialTitleSprite.visible = false;
        finalTitleSprite.visible = false;

        // In single mode, crossfade initial and final
        initialGroup.visible = t < 26;
        finalGroup.visible = t >= 20;
      } else {
        // Both in one space (Side-by-Side)
        initialGroup.position.set(-4.8, 0, 0);
        finalGroup.position.set(4.8, 0, 0);
        initialGroup.visible = true;
        finalGroup.visible = true;
        centerBridgeGroup.visible = true;
        initialTitleSprite.visible = true;
        finalTitleSprite.visible = true;
      }

      // Gentle auto-rotation
      if (curToggles.autoRotate) {
        finalGroup.rotation.y += delta * 0.2;
        initialGroup.rotation.y += delta * 0.15;
      }

      // Toggles visibility
      tetraLines.visible = curToggles.showTetrahedronFrame && t >= 26;
      tetraFaces.visible = curToggles.showTetrahedronFrame && t >= 26;
      arcLine.visible = curToggles.showAngleArc && t >= 30;
      angleLabel.visible = curToggles.showAngleArc && t >= 30;

      sp3Objects.forEach((obj) => {
        obj.minorMesh.visible = curToggles.showMinorLobes;
      });

      // -----------------------------------------------------------------------
      // FIGURE-8 (LEMNISCATE) CIRCULATION FOR P-ORBITAL ELECTRONS
      // The electrons circulate continuously along the 3D figure-8 path,
      // gliding smoothly through both lobes and narrowing through the nucleus.
      // -----------------------------------------------------------------------
      const updateFigure8Pos = (elGroup: THREE.Group, timeOffset: number) => {
        const tau = t * 2.4 + timeOffset;
        // Longitudinal coordinate along Z axis between positive and negative lobe apices
        const z = 0.94 * Math.sin(tau);
        // Transverse envelope: vanishes at nucleus (tau = 0, PI) and at apex domes (tau = PI/2, 3PI/2)
        const envelope = Math.sin(2 * tau);
        const x = 0.36 * envelope * Math.cos(tau * 0.7);
        const y = 0.36 * envelope * Math.sin(tau * 0.7);
        elGroup.position.set(x, y, z);
      };

      updateFigure8Pos(pxEl, 0);
      updateFigure8Pos(pyEl, Math.PI * 0.67);
      updateFigure8Pos(pzEl, Math.PI * 1.33);

      // Dynamic circulation inside sp3 hybrid major lobes
      sp3Objects.forEach((obj, idx) => {
        const phi = t * 2.2 + idx * (Math.PI / 2);
        const zPos = 1.35 + 0.28 * Math.sin(phi);
        const rad = 0.25 * Math.cos(phi);
        const xPos = rad * Math.cos(phi * 0.8);
        const yPos = rad * Math.sin(phi * 0.8);
        obj.elMesh.position.set(xPos, yPos, zPos);
      });

      // ----------------------------------------------------
      // JELENET 1: Alapállapot (t = 0 .. 10s)
      // ----------------------------------------------------
      if (t < 10) {
        // 2s has 2 electrons
        s2BoxNormal.visible = true;
        s2BoxExcited.visible = false;
        s2ElA.visible = curToggles.showElectrons;
        s2ElB.visible = curToggles.showElectrons;
        const eAngle = t * 2.0;
        s2ElA.position.set(Math.cos(eAngle) * 0.65, 0.2, Math.sin(eAngle) * 0.65);
        s2ElB.position.set(Math.cos(eAngle + Math.PI) * 0.65, -0.2, Math.sin(eAngle + Math.PI) * 0.65);

        // 2p orbitals: px and py have 1 electron, pz is empty
        pxEl.visible = curToggles.showElectrons;
        pyEl.visible = curToggles.showElectrons;
        pzEl.visible = false;
        pzMatPos.opacity = 0.18;
        pzMatNeg.opacity = 0.18;
        pzBoxEmpty.visible = true;
        pzBoxExcited.visible = false;
        initialExciteParticle.visible = false;

        // Final sp3 group is quiet preview or forming
        sp3Objects.forEach((obj) => {
          obj.group.scale.set(0.01, 0.01, 0.01);
          obj.boxSprite.visible = false;
          obj.elMesh.visible = false;
        });
        methaneGroup.visible = false;
      }

      // ----------------------------------------------------
      // JELENET 2: Elektrongerjesztés (t = 10 .. 20s)
      // 2s² 2p² -> 2s¹ 2p³
      // ----------------------------------------------------
      else if (t >= 10 && t < 20) {
        const exciteProg = Math.min(1, Math.max(0, (t - 11) / 3.5));

        // 2s box transitions from [ 2s ↑↓ ] to [ 2s ↑ ]
        if (exciteProg > 0.5) {
          s2BoxNormal.visible = false;
          s2BoxExcited.visible = true;
          s2ElB.visible = false; // electron left
        } else {
          s2BoxNormal.visible = true;
          s2BoxExcited.visible = false;
        }

        // Animated didactic travel of the excited electron from 2s to 2pz
        if (exciteProg > 0 && exciteProg < 1) {
          initialExciteParticle.visible = curToggles.showElectrons;
          const pStart = new THREE.Vector3(-1.8, 1.3, 0.3);
          const pMid = new THREE.Vector3(0, 2.0, 1.2);
          const pEnd = new THREE.Vector3(1.8, -1.7, 0.78);

          const curPos = new THREE.Vector3()
            .copy(pStart)
            .multiplyScalar(Math.pow(1 - exciteProg, 2))
            .add(pMid.clone().multiplyScalar(2 * (1 - exciteProg) * exciteProg))
            .add(pEnd.clone().multiplyScalar(Math.pow(exciteProg, 2)));

          initialExciteParticle.position.copy(curPos);
        } else {
          initialExciteParticle.visible = false;
        }

        // 2pz orbital lights up and box switches to [ 2pz ↑ ]
        pzMatPos.opacity = 0.18 + exciteProg * 0.34;
        pzMatNeg.opacity = 0.18 + exciteProg * 0.34;
        if (exciteProg >= 0.95) {
          pzEl.visible = curToggles.showElectrons;
          pzBoxEmpty.visible = false;
          pzBoxExcited.visible = true;
        } else {
          pzEl.visible = false;
          pzBoxEmpty.visible = true;
          pzBoxExcited.visible = false;
        }

        sp3Objects.forEach((obj) => {
          obj.group.scale.set(0.01, 0.01, 0.01);
          obj.boxSprite.visible = false;
        });
        methaneGroup.visible = false;
      }

      // ----------------------------------------------------
      // JELENET 3: A hibridizáció kezdete (t = 20 .. 30s)
      // Az sp³ hibridpályák EGYENKÉNT alakulnak ki a nyilak alatt!
      // ----------------------------------------------------
      else if (t >= 20 && t < 30) {
        initialExciteParticle.visible = false;
        methaneGroup.visible = false;

        const sp3Intervals = [
          { start: 20.0, end: 22.2 },
          { start: 22.2, end: 24.5 },
          { start: 24.5, end: 27.0 },
          { start: 27.0, end: 29.5 },
        ];

        sp3Objects.forEach((obj, idx) => {
          const { start, end } = sp3Intervals[idx];
          if (t < start) {
            obj.group.scale.set(0.01, 0.01, 0.01);
            obj.boxSprite.visible = false;
            obj.elMesh.visible = false;
          } else {
            const formProgress = Math.min(1, (t - start) / (end - start));
            const sc = THREE.MathUtils.lerp(0.05, 1.0, formProgress);
            obj.group.scale.set(sc, sc, sc);
            obj.majorMat.opacity = 0.48 * formProgress;
            obj.minorMat.opacity = 0.45 * formProgress;
            obj.boxSprite.visible = formProgress > 0.3;
            obj.elMesh.visible = curToggles.showElectrons && formProgress > 0.5;

            // Highlight newly formed orbital
            if (formProgress < 1) {
              obj.majorMat.emissive = new THREE.Color(0x06b6d4);
              obj.majorMat.emissiveIntensity = 0.5 * (1 - formProgress);
            } else {
              obj.majorMat.emissive = new THREE.Color(0x000000);
            }
          }
        });
      }

      // ----------------------------------------------------
      // JELENET 4: Tetraéderes térszerkezet (t = 30 .. 45s)
      // 4 db egyenértékű sp³ hibridpálya teljes egészében
      // ----------------------------------------------------
      else if (t >= 30 && t < 45) {
        sp3Objects.forEach((obj) => {
          obj.group.scale.set(1, 1, 1);
          obj.majorMat.opacity = 0.5;
          obj.minorMat.opacity = 0.45;
          obj.boxSprite.visible = true;
          obj.elMesh.visible = curToggles.showElectrons;
        });
        methaneGroup.visible = false;
      }

      // ----------------------------------------------------
      // JELENET 5: Metánmolekula képződése (t = 45 .. 60s)
      // 4 db C-H σ-kötés kialakulása
      // ----------------------------------------------------
      else {
        methaneGroup.visible = true;
        const methaneProg = Math.min(1, Math.max(0, (t - 45) / 6.0));
        const hDist = THREE.MathUtils.lerp(4.8, 2.15, methaneProg);

        sp3Objects.forEach((obj) => {
          obj.group.scale.set(1, 1, 1);
          obj.boxSprite.visible = methaneProg < 0.6;
        });

        hAtoms.forEach((h, i) => {
          const v = TETRAHEDRAL_VECTORS[i];
          const hPos = v.clone().multiplyScalar(hDist);
          h.nucleus.position.copy(hPos);
          h.cloud.position.copy(hPos);
          h.electron.position.copy(hPos);

          h.sigmaCloud.visible = methaneProg > 0.35 && curToggles.modelStyle === 'orbitals';
          h.sigmaCloud.position.copy(v.clone().multiplyScalar(1.15));
          h.sigmaMat.opacity = 0.55 * Math.min(1, (methaneProg - 0.35) * 2);

          // Model representation style
          if (curToggles.modelStyle === 'ballAndStick') {
            h.cloud.visible = false;
            h.sigmaCloud.visible = false;
            h.bondStick.visible = true;
            sp3Objects.forEach((o) => { o.group.visible = false; });
          } else if (curToggles.modelStyle === 'spaceFilling') {
            h.cloud.visible = true;
            h.cloud.scale.set(1.4, 1.4, 1.4);
            h.bondStick.visible = false;
            sp3Objects.forEach((o) => { o.group.visible = false; });
          } else {
            // Orbital overlap
            h.cloud.visible = true;
            h.cloud.scale.set(1, 1, 1);
            h.bondStick.visible = false;
            sp3Objects.forEach((o) => { o.group.visible = true; });
          }

          if (methaneProg > 0.8) {
            h.electron.position.copy(v.clone().multiplyScalar(1.25));
          }
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isProjectorMode]);

  return <div ref={containerRef} className="w-full h-full relative" />;
};
