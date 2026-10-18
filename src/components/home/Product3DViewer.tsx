'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Sparkles, Layers, RefreshCw } from 'lucide-react';

export interface Product3DConfig {
  id: string;
  name: string;
  brand: string;
  type: 'jar' | 'dropper' | 'flask';
  glassColor: number;
  liquidColor: number;
  capColor: number;
  labelBg: number;
  labelTitle: string;
  labelSubtitle: string;
  accentGold: boolean;
}

interface Product3DViewerProps {
  product: Product3DConfig;
  className?: string;
  onExplore?: () => void;
}

export function Product3DViewer({ product, className = '' }: Product3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const productGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0.006 });
  const targetRotationRef = useRef({ x: 0.1, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene Setup ---
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 4.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // --- 2. Lighting Setup ---
    const ambientLight = new THREE.AmbientLight(0xfff5f7, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    keyLight.position.set(4, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfce7ec, 1.6);
    fillLight.position.set(-4, 2, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffdf99, 2.4);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    const movingPointLight = new THREE.PointLight(0xffd700, 2.0, 8);
    movingPointLight.position.set(2, 2, 2.5);
    scene.add(movingPointLight);
    pointLightRef.current = movingPointLight;

    // --- 3. Floating Gold/Rose Particle System ---
    const particleCount = 45;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 5;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3;
      particleScales[i] = Math.random() * 0.05 + 0.02;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.06,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // --- 4. Product Geometry Creation ---
    const productGroup = new THREE.Group();
    scene.add(productGroup);
    productGroupRef.current = productGroup;

    buildProductMesh(productGroup, product);
    setLoading(false);

    // --- 5. Interactive Mouse/Touch Events ---
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;

        targetRotationRef.current.y += deltaX * 0.01;
        targetRotationRef.current.x += deltaY * 0.01;

        // Clamp vertical tilt
        targetRotationRef.current.x = Math.max(-0.6, Math.min(0.6, targetRotationRef.current.x));

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      } else {
        // Parallax highlight shift
        const rect = container.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        if (pointLightRef.current) {
          pointLightRef.current.position.x = mouseX * 3;
          pointLightRef.current.position.y = mouseY * 3 + 1;
        }
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
        const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

        targetRotationRef.current.y += deltaX * 0.012;
        targetRotationRef.current.x += deltaY * 0.012;
        targetRotationRef.current.x = Math.max(-0.6, Math.min(0.6, targetRotationRef.current.x));

        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // --- 6. Resize Handler ---
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // --- 7. Animation Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (productGroupRef.current) {
        if (autoRotate && !isDraggingRef.current) {
          targetRotationRef.current.y += 0.008;
        }

        // Smooth rotation damping
        productGroupRef.current.rotation.y += (targetRotationRef.current.y - productGroupRef.current.rotation.y) * 0.08;
        productGroupRef.current.rotation.x += (targetRotationRef.current.x - productGroupRef.current.rotation.x) * 0.08;

        // Subtle organic floating bob
        productGroupRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.08 - 0.05;
      }

      // Rotate sparkles
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.05;
        particlesRef.current.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [product.id, autoRotate]);

  // Rebuild product when product configuration changes
  useEffect(() => {
    if (productGroupRef.current) {
      buildProductMesh(productGroupRef.current, product);
    }
  }, [product]);

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full min-h-[360px] sm:min-h-[440px] cursor-grab active:cursor-grabbing flex items-center justify-center relative z-10"
        title="Click and drag to rotate 3D product"
      />

      {/* Floating 3D Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2.5 rounded-2xl backdrop-blur-md shadow-md border transition-all ${
            autoRotate
              ? 'bg-brand-600 text-white border-brand-500 shadow-glow-rose'
              : 'bg-white/90 text-charcoal-700 border-brand-100 hover:bg-white'
          }`}
          aria-label={autoRotate ? 'Pause 360 Rotation' : 'Start 360 Rotation'}
          title={autoRotate ? 'Pause 3D rotation' : 'Auto-rotate 3D product'}
        >
          <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
        </button>

        <button
          onClick={() => {
            targetRotationRef.current = { x: 0.1, y: 0 };
            if (productGroupRef.current) {
              productGroupRef.current.rotation.set(0.1, 0, 0);
            }
          }}
          className="p-2.5 rounded-2xl bg-white/90 text-charcoal-700 hover:text-brand-700 border border-brand-100 hover:bg-white backdrop-blur-md shadow-md transition-all"
          aria-label="Reset 3D View"
          title="Reset 3D View"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive 3D Feature Callouts / Badges */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-brand-200 text-charcoal-900 text-[11px] font-bold shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
          <span>Interactive 3D • Drag to Rotate 360°</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Builds procedural realistic 3D cosmetic container models with PBR glass, gold lids, and textures.
 */
function buildProductMesh(group: THREE.Group, config: Product3DConfig) {
  // Clear previous meshes
  while (group.children.length > 0) {
    const obj = group.children[0];
    group.remove(obj);
  }

  // Common Luxury Materials
  const goldCapMaterial = new THREE.MeshStandardMaterial({
    color: config.accentGold ? 0xd4af37 : config.capColor,
    metalness: 0.88,
    roughness: 0.22,
  });

  const frostedGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: config.glassColor,
    transparent: true,
    opacity: 0.82,
    roughness: 0.18,
    metalness: 0.1,
    transmission: 0.7,
    ior: 1.52,
    thickness: 0.8,
  });

  const innerCreamMaterial = new THREE.MeshStandardMaterial({
    color: config.liquidColor,
    roughness: 0.45,
    metalness: 0.05,
  });

  if (config.type === 'jar') {
    // --- JAR MODEL (Peptide Cream / Shea Soufflé) ---
    // Outer Jar Base (Double-walled frosted cylinder)
    const jarBaseGeo = new THREE.CylinderGeometry(0.85, 0.82, 0.95, 48);
    const jarBase = new THREE.Mesh(jarBaseGeo, frostedGlassMaterial);
    jarBase.position.y = 0;
    jarBase.castShadow = true;
    group.add(jarBase);

    // Inner Cream Emulsion Core
    const creamGeo = new THREE.CylinderGeometry(0.72, 0.7, 0.75, 36);
    const cream = new THREE.Mesh(creamGeo, innerCreamMaterial);
    cream.position.y = -0.05;
    group.add(cream);

    // Jar Golden Neck Ring
    const neckGeo = new THREE.CylinderGeometry(0.78, 0.82, 0.1, 48);
    const neck = new THREE.Mesh(neckGeo, goldCapMaterial);
    neck.position.y = 0.52;
    group.add(neck);

    // Jar Luxury Gold Cap
    const capGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.42, 48);
    const cap = new THREE.Mesh(capGeo, goldCapMaterial);
    cap.position.y = 0.74;
    cap.castShadow = true;
    group.add(cap);

    // Cap Top Bevel Ring
    const bevelGeo = new THREE.TorusGeometry(0.82, 0.04, 16, 48);
    const bevel = new THREE.Mesh(bevelGeo, goldCapMaterial);
    bevel.rotation.x = Math.PI / 2;
    bevel.position.y = 0.95;
    group.add(bevel);

    // Front Luxury Label Canvas
    const labelTexture = createLabelCanvasTexture(config.labelTitle, config.labelSubtitle, config.brand, config.labelBg);
    const labelMaterial = new THREE.MeshBasicMaterial({
      map: labelTexture,
      transparent: true,
    });
    const labelGeo = new THREE.CylinderGeometry(0.855, 0.825, 0.6, 48, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
    const labelMesh = new THREE.Mesh(labelGeo, labelMaterial);
    labelMesh.position.y = 0;
    group.add(labelMesh);
  } else if (config.type === 'dropper') {
    // --- DROPPER SERUM BOTTLE MODEL (Niacinamide / Essence) ---
    // Bottle Body
    const bottleGeo = new THREE.CylinderGeometry(0.6, 0.58, 1.45, 48);
    const bottle = new THREE.Mesh(bottleGeo, frostedGlassMaterial);
    bottle.position.y = -0.15;
    bottle.castShadow = true;
    group.add(bottle);

    // Inner Liquid Column
    const liquidGeo = new THREE.CylinderGeometry(0.48, 0.46, 1.25, 36);
    const liquid = new THREE.Mesh(liquidGeo, innerCreamMaterial);
    liquid.position.y = -0.22;
    group.add(liquid);

    // Bottle Shoulder & Neck
    const shoulderGeo = new THREE.ConeGeometry(0.6, 0.28, 48);
    const shoulder = new THREE.Mesh(shoulderGeo, frostedGlassMaterial);
    shoulder.position.y = 0.65;
    group.add(shoulder);

    const neckGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.25, 36);
    const neck = new THREE.Mesh(neckGeo, frostedGlassMaterial);
    neck.position.y = 0.85;
    group.add(neck);

    // Gold Dropper Collar
    const collarGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.32, 48);
    const collar = new THREE.Mesh(collarGeo, goldCapMaterial);
    collar.position.y = 1.05;
    group.add(collar);

    // Rubber Pipette Squeeze Bulb
    const bulbMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.8,
    });
    const bulbGeo = new THREE.SphereGeometry(0.26, 32, 24);
    bulbGeo.scale(1, 1.35, 1);
    const bulb = new THREE.Mesh(bulbGeo, bulbMaterial);
    bulb.position.y = 1.38;
    group.add(bulb);

    // Label
    const labelTexture = createLabelCanvasTexture(config.labelTitle, config.labelSubtitle, config.brand, config.labelBg);
    const labelMaterial = new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true });
    const labelGeo = new THREE.CylinderGeometry(0.605, 0.585, 0.95, 48, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
    const labelMesh = new THREE.Mesh(labelGeo, labelMaterial);
    labelMesh.position.y = -0.15;
    group.add(labelMesh);
  } else {
    // --- FLASK SPF FLUID MODEL (Anthelios Invisible SPF 50+) ---
    // Ergonomic rounded rectangular flask
    const flaskGeo = new THREE.CylinderGeometry(0.68, 0.62, 1.5, 48);
    flaskGeo.scale(1.25, 1, 0.65);
    const flask = new THREE.Mesh(flaskGeo, frostedGlassMaterial);
    flask.position.y = -0.1;
    group.add(flask);

    // Inner SPF Fluid
    const innerFluidGeo = new THREE.CylinderGeometry(0.55, 0.5, 1.3, 36);
    innerFluidGeo.scale(1.2, 1, 0.6);
    const innerFluid = new THREE.Mesh(innerFluidGeo, innerCreamMaterial);
    innerFluid.position.y = -0.15;
    group.add(innerFluid);

    // Top Dispenser Cap
    const capGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.45, 36);
    const cap = new THREE.Mesh(capGeo, goldCapMaterial);
    cap.position.y = 0.85;
    group.add(cap);

    // Label
    const labelTexture = createLabelCanvasTexture(config.labelTitle, config.labelSubtitle, config.brand, config.labelBg);
    const labelMaterial = new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true });
    const labelGeo = new THREE.CylinderGeometry(0.685, 0.625, 0.95, 48, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
    labelGeo.scale(1.25, 1, 0.65);
    const labelMesh = new THREE.Mesh(labelGeo, labelMaterial);
    labelMesh.position.y = -0.1;
    group.add(labelMesh);
  }
}

/**
 * Generates dynamic high-res label texture with brand typography and gold borders.
 */
function createLabelCanvasTexture(title: string, subtitle: string, brand: string, bgColor: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 380;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Background fill
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle Gold Border
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 10;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    ctx.strokeStyle = '#9D174D';
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, canvas.width - 52, canvas.height - 52);

    // Brand Name
    ctx.fillStyle = '#9D174D';
    ctx.font = 'bold 28px serif';
    ctx.textAlign = 'center';
    ctx.fillText(brand.toUpperCase(), canvas.width / 2, 85);

    // Thin separator line
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(canvas.width / 2 - 60, 105, 120, 3);

    // Product Title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(title, canvas.width / 2, 165);

    // Subtitle / Actives
    ctx.fillStyle = '#4B5563';
    ctx.font = '500 20px sans-serif';
    ctx.fillText(subtitle, canvas.width / 2, 215);

    // Origin stamp
    ctx.fillStyle = '#C5A059';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('GHANA • DERMATOLOGICALLY TESTED', canvas.width / 2, 280);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '14px sans-serif';
    ctx.fillText('50ml e / 1.7 fl. oz.', canvas.width / 2, 320);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
