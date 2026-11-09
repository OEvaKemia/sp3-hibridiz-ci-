import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ORBITAL_COLORS,
  getRotationToVector,
  createArcPoints,
} from '../chemistry/orbitalMath';
import {
  createSphereOrbitalGeometry,
  createFigure8LobeGeometry,
  createSp3HybridGeometry,
  createSigmaBondCloudGeometry,
} from '../chemistry/orbitalGeometries';
import {
  ETHANE_CA_VECTORS,
  ETHANE_CB_VECTORS,
  getRotatedEthaneVectors,
} from '../chemistry/ethaneMath';
import { SceneToggles } from './ChemistryScene';

interface EthaneSceneProps {
  currentTime: number;
  toggles: SceneToggles;
  isProjectorMode: boolean;
  canvasRefCallback?: (canvas: HTMLCanvasElement | null) => void;
}

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

function createStrongElectron(
  emissiveColor: number,
  haloColor: number,
  baseScale: number = 1.0
): THREE.Group {
  const group = new THREE.Group();

  const coreGeo = new THREE.SphereGeometry(0.14 * baseScale, 20, 20);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: emissiveColor,
    emissiveIntensity: 3.5,
    roughness: 0.1,
  });
  group.add(new THREE.Mesh(coreGeo, coreMat));

  const haloGeo = new THREE.SphereGeometry(0.26 * baseScale, 20, 20);
  const haloMat = new THREE.MeshBasicMaterial({
    color: haloColor,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  group.add(new THREE.Mesh(haloGeo, haloMat));

  const ringGeo = new THREE.RingGeometry(0.18 * baseScale, 0.28 * baseScale, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: emissiveColor,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  group.add(new THREE.Mesh(ringGeo, ringMat));

  return group;
}

export const EthaneScene: React.FC<EthaneSceneProps> = ({
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

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isProjectorMode ? 0xf8fafc : 0x020617);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 14.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isProjectorMode ? 1.05 : 1.25;

    container.appendChild(renderer.domElement);
    if (canvasRefCallback) {
      canvasRefCallback(renderer.domElement);
    }

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    scene.add(new THREE.AmbientLight(0xffffff, isProjectorMode ? 1.1 : 0.85));
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(7, 10, 8);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fillLight.position.set(-8, -2, -4);
    scene.add(fillLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 30.0;

    const nucleusGeo = new THREE.SphereGeometry(0.34, 28, 20);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
      roughness: 0.25,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
    });

    // =========================================================================
    // MASTER GROUPS: Carbon A (left) and Carbon B (right)
    // =========================================================================
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Initial separation distance (Scene 1-3) vs bonding distance (Scene 4-5)
    // In Scene 1-3, CA is at -3.8, CB is at +3.8
    // In Scene 4-5, CA moves to -1.4, CB moves to +1.4 (C-C bond distance = 2.8)
    const caGroup = new THREE.Group();
    const cbGroup = new THREE.Group();
    masterGroup.add(caGroup, cbGroup);

    // Nuclei
    const caNuc = new THREE.Mesh(nucleusGeo, nucleusMat);
    const cbNuc = new THREE.Mesh(nucleusGeo, nucleusMat);
    caGroup.add(caNuc);
    cbGroup.add(cbNuc);

    const caLabel = createTextSprite('C_A (Z=6)', 'rgba(14,165,233,0.3)', '#e0f2fe', '#0284c7', 22);
    caLabel.position.set(0, 0.65, 0);
    caLabel.scale.set(0.9, 0.45, 1);
    caGroup.add(caLabel);

    const cbLabel = createTextSprite('C_B (Z=6)', 'rgba(14,165,233,0.3)', '#e0f2fe', '#0284c7', 22);
    cbLabel.position.set(0, 0.65, 0);
    cbLabel.scale.set(0.9, 0.45, 1);
    cbGroup.add(cbLabel);

    // -------------------------------------------------------------------------
    // INITIAL ORBITALS: 2s Sphere + 3x 2p (px, py, pz) for BOTH Carbon atoms
    // -------------------------------------------------------------------------
    const createInitialOrbitals = (parentGroup: THREE.Group) => {
      const g = new THREE.Group();

      // 2s sphere
      const sMesh = new THREE.Mesh(
        createSphereOrbitalGeometry(1.6, 32, 24),
        new THREE.MeshPhysicalMaterial({
          color: ORBITAL_COLORS.sOrbital,
          transparent: true,
          opacity: 0.38,
          roughness: 0.2,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      const sElA = createStrongElectron(0xfacc15, 0xf59e0b);
      const sElB = createStrongElectron(0xfacc15, 0xf59e0b);
      g.add(sMesh, sElA, sElB);

      // 3x 2p figure-8 dumbbells
      const pxSub = new THREE.Group();
      pxSub.rotation.y = Math.PI / 2;
      const pxPos = new THREE.Mesh(
        createFigure8LobeGeometry(1.9, 0.75),
        new THREE.MeshPhysicalMaterial({ color: ORBITAL_COLORS.pxOrbitalPos, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })
      );
      const pxNeg = new THREE.Mesh(
        createFigure8LobeGeometry(1.9, 0.75),
        new THREE.MeshPhysicalMaterial({ color: ORBITAL_COLORS.pxOrbitalNeg, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })
      );
      pxNeg.rotateX(Math.PI);
      pxSub.add(pxPos, pxNeg);
      const pxEl = createStrongElectron(0xff0055, 0xf43f5e);
      pxSub.add(pxEl);
      g.add(pxSub);

      const pySub = new THREE.Group();
      pySub.rotation.x = -Math.PI / 2;
      const pyPos = new THREE.Mesh(
        createFigure8LobeGeometry(1.9, 0.75),
        new THREE.MeshPhysicalMaterial({ color: ORBITAL_COLORS.pyOrbitalPos, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })
      );
      const pyNeg = new THREE.Mesh(
        createFigure8LobeGeometry(1.9, 0.75),
        new THREE.MeshPhysicalMaterial({ color: ORBITAL_COLORS.pyOrbitalNeg, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })
      );
      pyNeg.rotateX(Math.PI);
      pySub.add(pyPos, pyNeg);
      const pyEl = createStrongElectron(0x00ff88, 0x10b981);
      pySub.add(pyEl);
      g.add(pySub);

      const pzSub = new THREE.Group();
      const pzPos = new THREE.Mesh(
        createFigure8LobeGeometry(1.9, 0.75),
        new THREE.MeshPhysicalMaterial({ color: ORBITAL_COLORS.pzOrbitalPos, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false })
      );
      const pzNeg = new THREE.Mesh(
        createFigure8LobeGeometry(1.9, 0.75),
        new THREE.MeshPhysicalMaterial({ color: ORBITAL_COLORS.pzOrbitalNeg, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false })
      );
      pzNeg.rotateX(Math.PI);
      pzSub.add(pzPos, pzNeg);
      const pzEl = createStrongElectron(0xd946ef, 0xa855f7);
      pzEl.visible = false;
      pzSub.add(pzEl);
      g.add(pzSub);

      parentGroup.add(g);
      return { g, sMesh, sElA, sElB, pxSub, pxEl, pySub, pyEl, pzSub, pzPos, pzNeg, pzEl };
    };

    const caInit = createInitialOrbitals(caGroup);
    const cbInit = createInitialOrbitals(cbGroup);

    // -------------------------------------------------------------------------
    // HYBRID ORBITALS: 4x sp3 for CA and 4x sp3 for CB
    // -------------------------------------------------------------------------
    const { majorGeo, minorGeo } = createSp3HybridGeometry(2.35, 1.1, 0.7, 0.4);

    const createSp3Set = (parentGroup: THREE.Group, vectors: THREE.Vector3[]) => {
      const g = new THREE.Group();
      const items: {
        itemGroup: THREE.Group;
        majorMesh: THREE.Mesh;
        minorMesh: THREE.Mesh;
        majorMat: THREE.MeshPhysicalMaterial;
        minorMat: THREE.MeshPhysicalMaterial;
        el: THREE.Group;
        vec: THREE.Vector3;
      }[] = [];

      vectors.forEach((vec, idx) => {
        const item = new THREE.Group();
        item.quaternion.copy(getRotationToVector(vec));

        const majorMat = new THREE.MeshPhysicalMaterial({
          color: idx === 0 ? 0x10b981 : ORBITAL_COLORS.sp3Major, // Lobe 0 is C-C bond lobe
          transparent: true,
          opacity: 0.48,
          roughness: 0.25,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const minorMat = new THREE.MeshPhysicalMaterial({
          color: ORBITAL_COLORS.sp3Minor,
          transparent: true,
          opacity: 0.42,
          roughness: 0.3,
          side: THREE.DoubleSide,
          depthWrite: false,
        });

        const majorMesh = new THREE.Mesh(majorGeo, majorMat);
        const minorMesh = new THREE.Mesh(minorGeo, minorMat);
        item.add(majorMesh, minorMesh);

        const el = createStrongElectron(idx === 0 ? 0x34d399 : 0x00f5ff, idx === 0 ? 0x10b981 : 0x06b6d4);
        el.position.set(0, 0, 1.4);
        item.add(el);

        g.add(item);
        items.push({ itemGroup: item, majorMesh, minorMesh, majorMat, minorMat, el, vec });
      });

      parentGroup.add(g);
      return { g, items };
    };

    const caSp3 = createSp3Set(caGroup, ETHANE_CA_VECTORS);
    const cbSp3 = createSp3Set(cbGroup, ETHANE_CB_VECTORS);

    // -------------------------------------------------------------------------
    // C-C SIGMA BOND CLOUD & 6x HYDROGEN ATOMS (Scenes 4 & 5)
    // -------------------------------------------------------------------------
    const ccSigmaCloudGeo = createSigmaBondCloudGeometry(2.8, 0.85);
    const ccSigmaMat = new THREE.MeshPhysicalMaterial({
      color: 0x10b981, // Emerald green for C-C sigma bond
      transparent: true,
      opacity: 0.58,
      clearcoat: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ccSigmaCloud = new THREE.Mesh(ccSigmaCloudGeo, ccSigmaMat);
    ccSigmaCloud.rotation.y = Math.PI / 2; // along X axis
    ccSigmaCloud.visible = false;
    masterGroup.add(ccSigmaCloud);

    // C-C bond stick
    const ccStickGeo = new THREE.CylinderGeometry(0.09, 0.09, 2.8, 16);
    const ccStickMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.4, roughness: 0.3 });
    const ccStick = new THREE.Mesh(ccStickGeo, ccStickMat);
    ccStick.rotation.z = Math.PI / 2;
    ccStick.visible = false;
    masterGroup.add(ccStick);

    // 6 Hydrogen atoms (3 on CA, 3 on CB)
    const hGroup = new THREE.Group();
    const hAtoms: {
      parent: THREE.Group;
      nuc: THREE.Mesh;
      cloud: THREE.Mesh;
      el: THREE.Group;
      sigmaCloud: THREE.Mesh;
      sigmaMat: THREE.MeshPhysicalMaterial;
      vec: THREE.Vector3;
    }[] = [];

    const hNucGeo = new THREE.SphereGeometry(0.22, 24, 20);
    const hNucMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.5 });
    const hCloudGeo = new THREE.SphereGeometry(0.68, 24, 20);
    const chSigmaGeo = createSigmaBondCloudGeometry(1.6, 0.6);

    // Attach 3 H atoms to CA (lobes 1, 2, 3)
    [ETHANE_CA_VECTORS[1], ETHANE_CA_VECTORS[2], ETHANE_CA_VECTORS[3]].forEach((v) => {
      const nuc = new THREE.Mesh(hNucGeo, hNucMat);
      const cloud = new THREE.Mesh(hCloudGeo, new THREE.MeshPhysicalMaterial({ color: ORBITAL_COLORS.hydrogenOrbital, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }));
      const el = createStrongElectron(0x60a5fa, 0x3b82f6);
      const sMat = new THREE.MeshPhysicalMaterial({ color: ORBITAL_COLORS.sigmaBond, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
      const sigma = new THREE.Mesh(chSigmaGeo, sMat);
      sigma.quaternion.copy(getRotationToVector(v));
      caGroup.add(nuc, cloud, el, sigma);
      hAtoms.push({ parent: caGroup, nuc, cloud, el, sigmaCloud: sigma, sigmaMat: sMat, vec: v });
    });

    // Attach 3 H atoms to CB (lobes 1, 2, 3)
    [ETHANE_CB_VECTORS[1], ETHANE_CB_VECTORS[2], ETHANE_CB_VECTORS[3]].forEach((v) => {
      const nuc = new THREE.Mesh(hNucGeo, hNucMat);
      const cloud = new THREE.Mesh(hCloudGeo, new THREE.MeshPhysicalMaterial({ color: ORBITAL_COLORS.hydrogenOrbital, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }));
      const el = createStrongElectron(0x60a5fa, 0x3b82f6);
      const sMat = new THREE.MeshPhysicalMaterial({ color: ORBITAL_COLORS.sigmaBond, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
      const sigma = new THREE.Mesh(chSigmaGeo, sMat);
      sigma.quaternion.copy(getRotationToVector(v));
      cbGroup.add(nuc, cloud, el, sigma);
      hAtoms.push({ parent: cbGroup, nuc, cloud, el, sigmaCloud: sigma, sigmaMat: sMat, vec: v });
    });

    // Angle Arc between C-C bond and C-H bond (109.5°)
    const arcRadius = 1.35;
    const arcPts = createArcPoints(ETHANE_CA_VECTORS[0], ETHANE_CA_VECTORS[1], arcRadius, 36);
    const arcLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(arcPts),
      new THREE.LineBasicMaterial({ color: ORBITAL_COLORS.angleArc, linewidth: 3 })
    );
    const arcLabel = createTextSprite('109,5°', 'rgba(250,204,21,0.35)', '#fef08a', '#facc15', 26);
    const arcMid = ETHANE_CA_VECTORS[0].clone().add(ETHANE_CA_VECTORS[1]).normalize().multiplyScalar(arcRadius + 0.35);
    arcLabel.position.copy(arcMid);
    caGroup.add(arcLine, arcLabel);

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

      // Rotate probability rings
      const pulseRate = t * 4;
      const haloScale = 1 + Math.sin(pulseRate) * 0.08;
      [caInit.pxEl, caInit.pyEl, caInit.pzEl, cbInit.pxEl, cbInit.pyEl, cbInit.pzEl].forEach((el) => {
        if (el.children[2]) el.children[2].rotation.z += delta * 2.5;
        if (el.children[1]) el.children[1].scale.set(haloScale, haloScale, haloScale);
      });

      // Figure-8 trajectory loop for all 2p electrons on both Carbon atoms
      const updateFig8 = (el: THREE.Group, offset: number) => {
        const tau = t * 2.4 + offset;
        const z = 0.94 * Math.sin(tau);
        const env = Math.sin(2 * tau);
        el.position.set(0.36 * env * Math.cos(tau * 0.7), 0.36 * env * Math.sin(tau * 0.7), z);
      };

      updateFig8(caInit.pxEl, 0);
      updateFig8(caInit.pyEl, 1.2);
      updateFig8(caInit.pzEl, 2.4);

      updateFig8(cbInit.pxEl, 0.6);
      updateFig8(cbInit.pyEl, 1.8);
      updateFig8(cbInit.pzEl, 3.0);

      // 2s orbital electrons rotation
      const eAngle = t * 2.0;
      caInit.sElA.position.set(Math.cos(eAngle) * 0.9, 0.3, Math.sin(eAngle) * 0.9);
      caInit.sElB.position.set(Math.cos(eAngle + Math.PI) * 0.9, -0.3, Math.sin(eAngle + Math.PI) * 0.9);
      cbInit.sElA.position.set(Math.cos(eAngle + 1) * 0.9, 0.3, Math.sin(eAngle + 1) * 0.9);
      cbInit.sElB.position.set(Math.cos(eAngle + 1 + Math.PI) * 0.9, -0.3, Math.sin(eAngle + 1 + Math.PI) * 0.9);

      // Minor lobes toggle
      caSp3.items.forEach((it) => { it.minorMesh.visible = curToggles.showMinorLobes; });
      cbSp3.items.forEach((it) => { it.minorMesh.visible = curToggles.showMinorLobes; });

      // Arc visibility
      arcLine.visible = curToggles.showAngleArc && t >= 30;
      arcLabel.visible = curToggles.showAngleArc && t >= 30;

      // ----------------------------------------------------
      // JELENET 1: Két szénatom alapállapota (t = 0 .. 10s)
      // ----------------------------------------------------
      if (t < 10) {
        caGroup.position.set(-3.6, 0, 0);
        cbGroup.position.set(3.6, 0, 0);
        caInit.g.visible = true;
        cbInit.g.visible = true;
        caSp3.g.visible = false;
        cbSp3.g.visible = false;
        ccSigmaCloud.visible = false;
        ccStick.visible = false;
        hAtoms.forEach((h) => { h.nuc.visible = false; h.cloud.visible = false; h.el.visible = false; h.sigmaCloud.visible = false; });

        caInit.sElB.visible = curToggles.showElectrons;
        cbInit.sElB.visible = curToggles.showElectrons;
        caInit.pzEl.visible = false;
        cbInit.pzEl.visible = false;
        caInit.pzPos.material.opacity = 0.18;
        cbInit.pzPos.material.opacity = 0.18;
      }

      // ----------------------------------------------------
      // JELENET 2: Elektrongerjesztés mindkét szénatomban (t = 10 .. 20s)
      // ----------------------------------------------------
      else if (t >= 10 && t < 20) {
        caGroup.position.set(-3.6, 0, 0);
        cbGroup.position.set(3.6, 0, 0);
        caInit.g.visible = true;
        cbInit.g.visible = true;
        caSp3.g.visible = false;
        cbSp3.g.visible = false;
        ccSigmaCloud.visible = false;
        ccStick.visible = false;

        const exciteProg = Math.min(1, Math.max(0, (t - 11) / 3.5));
        caInit.sElB.visible = exciteProg < 0.5 && curToggles.showElectrons;
        cbInit.sElB.visible = exciteProg < 0.5 && curToggles.showElectrons;

        caInit.pzPos.material.opacity = 0.18 + exciteProg * 0.32;
        cbInit.pzPos.material.opacity = 0.18 + exciteProg * 0.32;
        caInit.pzEl.visible = exciteProg >= 0.95 && curToggles.showElectrons;
        cbInit.pzEl.visible = exciteProg >= 0.95 && curToggles.showElectrons;
      }

      // ----------------------------------------------------
      // JELENET 3: Párhuzamos sp³ hibridizáció (t = 20 .. 30s)
      // ----------------------------------------------------
      else if (t >= 20 && t < 30) {
        caGroup.position.set(-3.6, 0, 0);
        cbGroup.position.set(3.6, 0, 0);

        const hybridProg = Math.min(1, Math.max(0, (t - 20) / 7.5));
        caInit.g.visible = hybridProg < 0.95;
        cbInit.g.visible = hybridProg < 0.95;
        caSp3.g.visible = true;
        cbSp3.g.visible = true;
        ccSigmaCloud.visible = false;

        const sc = THREE.MathUtils.lerp(0.05, 1.0, hybridProg);
        caSp3.g.scale.set(sc, sc, sc);
        cbSp3.g.scale.set(sc, sc, sc);

        caSp3.items.forEach((it) => { it.majorMat.opacity = 0.48 * hybridProg; });
        cbSp3.items.forEach((it) => { it.majorMat.opacity = 0.48 * hybridProg; });
      }

      // ----------------------------------------------------
      // JELENET 4: C–C szigma-kötés & Szabad rotáció (t = 30 .. 45s)
      // ----------------------------------------------------
      else if (t >= 30 && t < 45) {
        caInit.g.visible = false;
        cbInit.g.visible = false;
        caSp3.g.visible = true;
        cbSp3.g.visible = true;
        caSp3.g.scale.set(1, 1, 1);
        cbSp3.g.scale.set(1, 1, 1);

        // Approach from separation (3.6) to C-C bond length (1.4)
        const approachProg = Math.min(1, Math.max(0, (t - 30) / 4.5));
        const cDist = THREE.MathUtils.lerp(3.6, 1.4, approachProg);
        caGroup.position.set(-cDist, 0, 0);
        cbGroup.position.set(cDist, 0, 0);

        // C-C Sigma Bond cloud appears
        ccSigmaCloud.visible = approachProg > 0.4 && curToggles.modelStyle === 'orbitals';
        ccSigmaCloud.scale.set(1, 1, 1);
        ccSigmaMat.opacity = 0.58 * Math.min(1, (approachProg - 0.4) * 2);

        // Demonstrating free rotation around C-C bond:
        // Carbon B rotates smoothly around the C-C axis!
        if (approachProg >= 0.95) {
          const rotAngle = (t - 34.5) * 0.4;
          cbGroup.rotation.x = rotAngle;
        }

        hAtoms.forEach((h) => { h.nuc.visible = false; h.cloud.visible = false; h.el.visible = false; h.sigmaCloud.visible = false; });
      }

      // ----------------------------------------------------
      // JELENET 5: 6 Hidrogén beépülése -> Etán C₂H₆ (t = 45 .. 60s)
      // ----------------------------------------------------
      else {
        caInit.g.visible = false;
        cbInit.g.visible = false;
        caGroup.position.set(-1.4, 0, 0);
        cbGroup.position.set(1.4, 0, 0);

        const ethaneProg = Math.min(1, Math.max(0, (t - 45) / 5.5));
        const hDist = THREE.MathUtils.lerp(4.5, 2.15, ethaneProg);

        // Continuous gentle free rotation around C-C axis
        cbGroup.rotation.x += delta * 0.35;

        // Model style representations
        if (curToggles.modelStyle === 'ballAndStick') {
          ccSigmaCloud.visible = false;
          ccStick.visible = true;
          caSp3.g.visible = false;
          cbSp3.g.visible = false;
          hAtoms.forEach((h) => {
            h.cloud.visible = false;
            h.sigmaCloud.visible = false;
            h.nuc.visible = true;
            h.nuc.position.copy(h.vec.clone().multiplyScalar(2.15));
            h.el.visible = false;
          });
        } else if (curToggles.modelStyle === 'spaceFilling') {
          ccSigmaCloud.visible = false;
          ccStick.visible = false;
          caSp3.g.visible = false;
          cbSp3.g.visible = false;
          hAtoms.forEach((h) => {
            h.cloud.visible = true;
            h.cloud.scale.set(1.4, 1.4, 1.4);
            h.sigmaCloud.visible = false;
            h.nuc.visible = true;
            h.nuc.position.copy(h.vec.clone().multiplyScalar(2.15));
            h.cloud.position.copy(h.vec.clone().multiplyScalar(2.15));
            h.el.visible = false;
          });
        } else {
          // Scientific orbital overlap
          ccStick.visible = false;
          ccSigmaCloud.visible = true;
          caSp3.g.visible = true;
          cbSp3.g.visible = true;

          hAtoms.forEach((h) => {
            h.nuc.visible = true;
            h.cloud.visible = true;
            h.cloud.scale.set(1, 1, 1);
            h.el.visible = curToggles.showElectrons;
            const hPos = h.vec.clone().multiplyScalar(hDist);
            h.nuc.position.copy(hPos);
            h.cloud.position.copy(hPos);
            h.el.position.copy(hPos);

            h.sigmaCloud.visible = ethaneProg > 0.35;
            h.sigmaCloud.position.copy(h.vec.clone().multiplyScalar(1.15));
            h.sigmaMat.opacity = 0.55 * Math.min(1, (ethaneProg - 0.35) * 2);
          });
        }
      }

      if (curToggles.autoRotate) {
        masterGroup.rotation.y += delta * 0.18;
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
