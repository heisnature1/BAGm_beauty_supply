'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { RotateCw, Sparkles, RefreshCw, ShoppingBag, ArrowRight } from 'lucide-react';

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
  price: number;
  slug: string;
}

interface Product3DViewerProps {
  product: Product3DConfig;
  className?: string;
  shopHref?: string;
}

export function Product3DViewer({ product, className = '', shopHref = '/shop' }: Product3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const productGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);

  const isDraggingRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.1, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene Setup ---
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    // Adjusted camera distance for majestic hero presence
    camera.position.set(0, 0.25, 4.3);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // --- 2. Dynamic Lighting Setup ---
    const ambientLight = new THREE.AmbientLight(0xfff7f8, 1.6);
    scene.add(ambientLight);

    // Warm Key Light (Top-Right)
    const keyLight = new THREE.DirectionalLight(0xfff0dd, 2.4);
    keyLight.position.set(4, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Soft Rose Fill Light (Left)
    const fillLight = new THREE.DirectionalLight(0xfce7ec, 1.8);
    fillLight.position.set(-4, 2, 3);
    scene.add(fillLight);

    // Gold Rim Light (Back-Top)
    const rimLight = new THREE.DirectionalLight(0xffdf99, 2.8);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // Interactive Mouse Specular Light
    const movingPointLight = new THREE.PointLight(0xffd700, 2.2, 10);
    movingPointLight.position.set(2, 2.5, 3);
    scene.add(movingPointLight);
    pointLightRef.current = movingPointLight;

    // --- 3. Floating 3D Gold Particles ---
    const particleCount = 60;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.07,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // --- 4. Product 3D Mesh ---
    const productGroup = new THREE.Group();
    scene.add(productGroup);
    productGroupRef.current = productGroup;

    buildProductMesh(productGroup, product);

    // --- 5. Mouse & Touch Drag Interaction ---
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      dragDistanceRef.current = 0;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;
        dragDistanceRef.current += Math.abs(deltaX) + Math.abs(deltaY);

        targetRotationRef.current.y += deltaX * 0.009;
        targetRotationRef.current.x += deltaY * 0.009;
        targetRotationRef.current.x = Math.max(-0.55, Math.min(0.55, targetRotationRef.current.x));

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      } else {
        const rect = container.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        if (pointLightRef.current) {
          pointLightRef.current.position.x = mouseX * 3.5;
          pointLightRef.current.position.y = mouseY * 3 + 1.5;
        }
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        dragDistanceRef.current = 0;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
        const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;
        dragDistanceRef.current += Math.abs(deltaX) + Math.abs(deltaY);

        targetRotationRef.current.y += deltaX * 0.011;
        targetRotationRef.current.x += deltaY * 0.011;
        targetRotationRef.current.x = Math.max(-0.55, Math.min(0.55, targetRotationRef.current.x));

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
          targetRotationRef.current.y += 0.007;
        }

        // Smooth rotation damping
        productGroupRef.current.rotation.y += (targetRotationRef.current.y - productGroupRef.current.rotation.y) * 0.08;
        productGroupRef.current.rotation.x += (targetRotationRef.current.x - productGroupRef.current.rotation.x) * 0.08;

        // Subtle organic floating motion
        productGroupRef.current.position.y = Math.sin(elapsedTime * 1.6) * 0.09 - 0.02;
      }

      // Floating particles orbit
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.04;
        particlesRef.current.rotation.x = Math.sin(elapsedTime * 0.3) * 0.08;
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
    <div
      className={`relative w-full h-full select-none flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full min-h-[420px] sm:min-h-[500px] lg:min-h-[560px] cursor-grab active:cursor-grabbing flex items-center justify-center relative z-10"
        title="Click and drag to rotate 3D product in 360°"
      />

      {/* Floating Interactive "Shop With Us" 3D Callout Badge / Button */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex flex-col items-center">
        <Link
          href={shopHref}
          className="pointer-events-auto transform translate-y-28 sm:translate-y-36 group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/95 hover:bg-brand-600 text-charcoal-900 hover:text-white border-2 border-brand-300 hover:border-brand-600 font-bold text-xs sm:text-sm tracking-wide shadow-luxury-hover hover:scale-108 active:scale-95 transition-all duration-300 backdrop-blur-md"
        >
          <ShoppingBag className="w-4 h-4 text-brand-600 group-hover:text-white transition-colors" />
          <span>Shop With Us</span>
          <ArrowRight className="w-4 h-4 text-gold-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Top Right Floating Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2.5 rounded-2xl backdrop-blur-md shadow-md border transition-all ${
            autoRotate
              ? 'bg-brand-600 text-white border-brand-500 shadow-glow-rose'
              : 'bg-white/90 text-charcoal-700 border-brand-100 hover:bg-white'
          }`}
          aria-label={autoRotate ? 'Pause 360 Rotation' : 'Start 360 Rotation'}
          title={autoRotate ? 'Pause 360° rotation' : 'Auto-rotate 3D product'}
        >
          <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '4.5s' }} />
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

      {/* Bottom Hint Pill */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:left-6 sm:translate-x-0 z-20 flex items-center gap-2 pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-brand-200 text-charcoal-900 text-[11px] font-bold shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
          <span>Interactive 3D Stage • Drag to Spin 360°</span>
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

  // Luxury PBR Materials
  const goldCapMaterial = new THREE.MeshStandardMaterial({
    color: config.accentGold ? 0xd4af37 : config.capColor,
    metalness: 0.9,
    roughness: 0.2,
  });

  const frostedGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: config.glassColor,
    transparent: true,
    opacity: 0.84,
    roughness: 0.16,
    metalness: 0.1,
    transmission: 0.72,
    ior: 1.54,
    thickness: 0.85,
  });

  const innerCreamMaterial = new THREE.MeshStandardMaterial({
    color: config.liquidColor,
    roughness: 0.42,
    metalness: 0.05,
  });

  if (config.type === 'jar') {
    // --- JAR MODEL (Peptide Cream / Shea Soufflé) ---
    // Outer Jar Base (Double-walled frosted cylinder)
    const jarBaseGeo = new THREE.CylinderGeometry(0.92, 0.88, 1.05, 48);
    const jarBase = new THREE.Mesh(jarBaseGeo, frostedGlassMaterial);
    jarBase.position.y = 0;
    jarBase.castShadow = true;
    group.add(jarBase);

    // Inner Cream Emulsion Core
    const creamGeo = new THREE.CylinderGeometry(0.78, 0.75, 0.85, 36);
    const cream = new THREE.Mesh(creamGeo, innerCreamMaterial);
    cream.position.y = -0.06;
    group.add(cream);

    // Jar Golden Neck Ring
    const neckGeo = new THREE.CylinderGeometry(0.84, 0.88, 0.12, 48);
    const neck = new THREE.Mesh(neckGeo, goldCapMaterial);
    neck.position.y = 0.58;
    group.add(neck);

    // Jar Luxury Gold Cap
    const capGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.45, 48);
    const cap = new THREE.Mesh(capGeo, goldCapMaterial);
    cap.position.y = 0.82;
    cap.castShadow = true;
    group.add(cap);

    // Cap Top Bevel Ring
    const bevelGeo = new THREE.TorusGeometry(0.88, 0.045, 16, 48);
    const bevel = new THREE.Mesh(bevelGeo, goldCapMaterial);
    bevel.rotation.x = Math.PI / 2;
    bevel.position.y = 1.05;
    group.add(bevel);

    // Front Luxury Label Canvas
    const labelTexture = createLabelCanvasTexture(config.labelTitle, config.labelSubtitle, config.brand, config.labelBg);
    const labelMaterial = new THREE.MeshBasicMaterial({
      map: labelTexture,
      transparent: true,
    });
    const labelGeo = new THREE.CylinderGeometry(0.925, 0.885, 0.65, 48, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
    const labelMesh = new THREE.Mesh(labelGeo, labelMaterial);
    labelMesh.position.y = 0;
    group.add(labelMesh);
  } else if (config.type === 'dropper') {
    // --- DROPPER SERUM BOTTLE MODEL (Niacinamide / Essence) ---
    const bottleGeo = new THREE.CylinderGeometry(0.65, 0.62, 1.55, 48);
    const bottle = new THREE.Mesh(bottleGeo, frostedGlassMaterial);
    bottle.position.y = -0.15;
    bottle.castShadow = true;
    group.add(bottle);

    const liquidGeo = new THREE.CylinderGeometry(0.52, 0.5, 1.35, 36);
    const liquid = new THREE.Mesh(liquidGeo, innerCreamMaterial);
    liquid.position.y = -0.22;
    group.add(liquid);

    const shoulderGeo = new THREE.ConeGeometry(0.65, 0.3, 48);
    const shoulder = new THREE.Mesh(shoulderGeo, frostedGlassMaterial);
    shoulder.position.y = 0.7;
    group.add(shoulder);

    const neckGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.28, 36);
    const neck = new THREE.Mesh(neckGeo, frostedGlassMaterial);
    neck.position.y = 0.92;
    group.add(neck);

    const collarGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.35, 48);
    const collar = new THREE.Mesh(collarGeo, goldCapMaterial);
    collar.position.y = 1.15;
    group.add(collar);

    const bulbMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.8,
    });
    const bulbGeo = new THREE.SphereGeometry(0.28, 32, 24);
    bulbGeo.scale(1, 1.35, 1);
    const bulb = new THREE.Mesh(bulbGeo, bulbMaterial);
    bulb.position.y = 1.5;
    group.add(bulb);

    const labelTexture = createLabelCanvasTexture(config.labelTitle, config.labelSubtitle, config.brand, config.labelBg);
    const labelMaterial = new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true });
    const labelGeo = new THREE.CylinderGeometry(0.655, 0.625, 1.05, 48, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
    const labelMesh = new THREE.Mesh(labelGeo, labelMaterial);
    labelMesh.position.y = -0.15;
    group.add(labelMesh);
  } else {
    // --- FLASK SPF FLUID MODEL (Anthelios Invisible SPF 50+) ---
    const flaskGeo = new THREE.CylinderGeometry(0.72, 0.66, 1.6, 48);
    flaskGeo.scale(1.25, 1, 0.65);
    const flask = new THREE.Mesh(flaskGeo, frostedGlassMaterial);
    flask.position.y = -0.1;
    group.add(flask);

    const innerFluidGeo = new THREE.CylinderGeometry(0.58, 0.52, 1.4, 36);
    innerFluidGeo.scale(1.2, 1, 0.6);
    const innerFluid = new THREE.Mesh(innerFluidGeo, innerCreamMaterial);
    innerFluid.position.y = -0.15;
    group.add(innerFluid);

    const capGeo = new THREE.CylinderGeometry(0.3, 0.34, 0.48, 36);
    const cap = new THREE.Mesh(capGeo, goldCapMaterial);
    cap.position.y = 0.92;
    group.add(cap);

    const labelTexture = createLabelCanvasTexture(config.labelTitle, config.labelSubtitle, config.brand, config.labelBg);
    const labelMaterial = new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true });
    const labelGeo = new THREE.CylinderGeometry(0.725, 0.665, 1.05, 48, 1, true, -Math.PI / 3, (2 * Math.PI) / 3);
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
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 10;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    ctx.strokeStyle = '#9D174D';
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, canvas.width - 52, canvas.height - 52);

    ctx.fillStyle = '#9D174D';
    ctx.font = 'bold 28px serif';
    ctx.textAlign = 'center';
    ctx.fillText(brand.toUpperCase(), canvas.width / 2, 85);

    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(canvas.width / 2 - 60, 105, 120, 3);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(title, canvas.width / 2, 165);

    ctx.fillStyle = '#4B5563';
    ctx.font = '500 20px sans-serif';
    ctx.fillText(subtitle, canvas.width / 2, 215);

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
