import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Hero3DCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dimensions
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Group for the 3D sculpture
    const group = new THREE.Group();
    scene.add(group);

    // 1. Central Spatial Art Frame (floating floating canvas slab)
    const frameGeometry = new THREE.BoxGeometry(2.4, 3.2, 0.12);
    const frameMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.15,
      roughness: 0.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    group.add(frameMesh);

    // Inner Canvas Surface (Artistic Gradient / Light Surface)
    const canvasGeometry = new THREE.PlaneGeometry(2.1, 2.9);
    const canvasMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1efe9,
      roughness: 0.4,
      metalness: 0.05,
    });
    const canvasMesh = new THREE.Mesh(canvasGeometry, canvasMaterial);
    canvasMesh.position.z = 0.065;
    group.add(canvasMesh);

    // 2. Kinetic Gyroscopic Metallic Rings
    const ring1Geo = new THREE.TorusGeometry(2.3, 0.035, 24, 100);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xd4d8df,
      metalness: 0.85,
      roughness: 0.25,
    });
    const ring1 = new THREE.Mesh(ring1Geo, metalMat);
    group.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.6, 0.025, 24, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x9fa8b8,
      metalness: 0.9,
      roughness: 0.2,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    group.add(ring2);

    // 3. Floating Ethereal Prismatic Nodes (orbiting spheres)
    const nodeGeo = new THREE.SphereGeometry(0.12, 32, 32);
    const nodeMat = new THREE.MeshPhysicalMaterial({
      color: 0x4a72ff, // subtle electric blue accent
      metalness: 0.3,
      roughness: 0.1,
      transmission: 0.7,
      thickness: 0.5,
      ior: 1.5,
    });

    const nodes: THREE.Mesh[] = [];
    const nodeOffsets = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
    nodeOffsets.forEach((offset) => {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      group.add(node);
      nodes.push(node);
    });

    // 4. Subtle Ambient Particle Field
    const particlesCount = 80;
    const particlePositions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: 0xa0a8b4,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbe3f0, 1.2);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    const accentLight = new THREE.PointLight(0x5073ff, 2.0, 10);
    accentLight.position.set(2, -3, 2);
    scene.add(accentLight);

    // Interactive mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 0.8;
      targetY = y * 0.8;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      if (!prefersReducedMotion) {
        // Subtle levitation
        group.position.y = Math.sin(elapsedTime * 0.8) * 0.12;

        // Controlled rotation with parallax
        group.rotation.y = mouseX + Math.sin(elapsedTime * 0.3) * 0.1;
        group.rotation.x = -mouseY + Math.cos(elapsedTime * 0.4) * 0.06;

        // Ring kinetics
        ring1.rotation.z = elapsedTime * 0.25;
        ring1.rotation.x = Math.sin(elapsedTime * 0.2) * 0.4;

        ring2.rotation.y = -elapsedTime * 0.3;
        ring2.rotation.z = Math.cos(elapsedTime * 0.25) * 0.3;

        // Orbiting nodes
        nodes.forEach((node, idx) => {
          const angle = elapsedTime * 0.5 + nodeOffsets[idx];
          node.position.x = Math.cos(angle) * 2.5;
          node.position.y = Math.sin(angle) * 1.5;
          node.position.z = Math.sin(angle * 2) * 0.8;
        });

        // Subtle particle drift
        particles.rotation.y = elapsedTime * 0.03;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      frameGeometry.dispose();
      frameMaterial.dispose();
      canvasGeometry.dispose();
      canvasMaterial.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      metalMat.dispose();
      ring2Mat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      id="hero-3d-canvas-container"
      ref={mountRef}
      className="relative w-full h-[460px] md:h-[540px] lg:h-[600px] flex items-center justify-center pointer-events-none select-none"
    >
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#f7f6f2] pointer-events-none" />
    </div>
  );
};
