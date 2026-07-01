// src/components/ThreeBackground.jsx
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ThreeBackground = () => {
  const canvasRef = useRef(null);
  const location = useLocation();
  const cleanupRef = useRef(null);

  useEffect(() => {
    const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let active = true;

    // If reduced motion is preferred, don't run 3D and set all reveals to visible immediately
    if (REDUCE) {
      document.querySelectorAll('.reveal').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Dynamic import for Three.js and GSAP
    Promise.all([
      import('three'),
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([THREE, { default: gsap }, { ScrollTrigger }]) => {
      if (!active) return;
      gsap.registerPlugin(ScrollTrigger);

      // --- THREE.JS BACKGROUND ---
      const canvas = canvasRef.current;
      if (!canvas) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.z = 6.4;

      const GOLD = 0xD4AF37;
      const GOLD2 = 0xE6C46A;
      const mobile = window.innerWidth < 640;

      // Soft radial sprite texture
      function glowTex() {
        const c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        const x = c.getContext('2d');
        const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, 'rgba(255,240,200,1)');
        g.addColorStop(0.3, 'rgba(230,196,106,.7)');
        g.addColorStop(1, 'rgba(230,196,106,0)');
        x.fillStyle = g;
        x.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
      }
      const tex = glowTex();

      const group = new THREE.Group();
      scene.add(group);

      // --- LIGHTWEIGHT FLOATING CONSTELLATION NETWORK ---
      const particleCount = mobile ? 50 : 110;
      const pos = new Float32Array(particleCount * 3);
      const particlesData = [];

      for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * 11;
        const y = (Math.random() - 0.5) * 8;
        const z = (Math.random() - 0.5) * 5;

        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;

        particlesData.push({
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.002,
            (Math.random() - 0.5) * 0.002,
            (Math.random() - 0.5) * 0.002
          )
        });
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));

      const pointsMat = new THREE.PointsMaterial({
        map: tex,
        color: GOLD2,
        size: 0.12,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const points = new THREE.Points(particleGeometry, pointsMat);
      group.add(points);

      // Faint connections
      const maxConnections = mobile ? 50 : 110;
      const linePositions = new Float32Array(maxConnections * 2 * 3);
      const lineColors = new Float32Array(maxConnections * 2 * 3);

      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

      const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
      });

      const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
      group.add(lineSegments);

      group.rotation.x = 0.4;
      const mouse = { x: 0, y: 0 };

      const handleMouseMove = (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener('mousemove', handleMouseMove);

      const handleResize = () => {
        if (!canvas) return;
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        camera.position.z = window.innerWidth < 640 ? 7.8 : 6.4;
      };
      window.addEventListener('resize', handleResize);
      handleResize();

      let scrollProgress = 0;
      const handleScroll = () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();

      let t = 0;
      let frameId;
      function frame() {
        t += 0.01;
        group.rotation.y += 0.0004;
        group.rotation.x += ((0.4 + mouse.y * 0.15) - group.rotation.x) * 0.05;
        group.rotation.z += (mouse.x * 0.03 - group.rotation.z) * 0.05;

        // Scroll drift
        const p = scrollProgress;
        group.position.x += (p * (window.innerWidth < 640 ? 0.3 : 1.8) - group.position.x) * 0.06;
        group.position.y += (p * 0.4 - group.position.y) * 0.06;

        // Update positions of particles
        const posAttr = points.geometry.attributes.position;
        const linePosAttr = lineSegments.geometry.attributes.position;
        const lineColorAttr = lineSegments.geometry.attributes.color;

        let vertexIdx = 0;
        let colorIdx = 0;
        let numConnections = 0;

        for (let i = 0; i < particleCount; i++) {
          let x = posAttr.getX(i);
          let y = posAttr.getY(i);
          let z = posAttr.getZ(i);

          const data = particlesData[i];
          x += data.velocity.x;
          y += data.velocity.y;
          z += data.velocity.z;

          // Soft boundary bounce
          if (x < -6.5 || x > 6.5) data.velocity.x *= -1;
          if (y < -5 || y > 5) data.velocity.y *= -1;
          if (z < -4 || z > 3) data.velocity.z *= -1;

          posAttr.setXYZ(i, x, y, z);
        }

        // Build dynamic light connections
        for (let i = 0; i < particleCount; i++) {
          const x1 = posAttr.getX(i);
          const y1 = posAttr.getY(i);
          const z1 = posAttr.getZ(i);

          for (let j = i + 1; j < particleCount; j++) {
            const x2 = posAttr.getX(j);
            const y2 = posAttr.getY(j);
            const z2 = posAttr.getZ(j);

            const dx = x1 - x2;
            const dy = y1 - y2;
            const dz = z1 - z2;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < 1.7 && numConnections < maxConnections) {
              linePosAttr.setXYZ(vertexIdx, x1, y1, z1);
              linePosAttr.setXYZ(vertexIdx + 1, x2, y2, z2);

              const alpha = (1.0 - dist / 1.7) * 0.35;
              const r = 230 / 255 * alpha;
              const g = 196 / 255 * alpha;
              const b = 106 / 255 * alpha;

              lineColorAttr.setXYZ(colorIdx, r, g, b);
              lineColorAttr.setXYZ(colorIdx + 1, r, g, b);

              vertexIdx += 2;
              colorIdx += 2;
              numConnections++;
            }
          }
        }

        posAttr.needsUpdate = true;
        linePosAttr.needsUpdate = true;
        lineColorAttr.needsUpdate = true;
        lineSegments.geometry.setDrawRange(0, numConnections * 2);

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(frame);
      }
      frame();

      // --- GSAP REVEALS & COUNT-UPS (Page specific) ---
      const initGsapAnimations = () => {
        // Clear old ones first
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

        // Set initial states for reveals
        gsap.set('.reveal', { opacity: 0, y: 34 });

        // Setup triggers
        gsap.utils.toArray('.reveal').forEach((el) => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 86%',
            },
          });
        });

        // Setup count-ups
        gsap.utils.toArray('.stat b').forEach((el) => {
          const end = +el.dataset.count;
          const suf = el.dataset.suffix || '';
          if (isNaN(end)) return;
          const o = { v: 0 };
          ScrollTrigger.create({
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: () => {
              gsap.to(o, {
                v: end,
                duration: 1.6,
                ease: 'power2.out',
                onUpdate: () => {
                  el.textContent = Math.round(o.v) + suf;
                },
              });
            },
          });
        });

        ScrollTrigger.refresh();
      };

      // Run immediately and after a short delay to account for React rendering
      initGsapAnimations();
      const delayTimeout = setTimeout(initGsapAnimations, 250);

      // --- CLEANUP REFERENCES ---
      cleanupRef.current = () => {
        active = false;
        clearTimeout(delayTimeout);
        cancelAnimationFrame(frameId);

        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);

        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

        // Dispose ThreeJS resources
        scene.remove(group);

        particleGeometry.dispose();
        pointsMat.dispose();
        lineGeometry.dispose();
        lineMaterial.dispose();
        tex.dispose();

        renderer.dispose();
      };
    });

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      active = false;
    };
  }, [location.pathname]);

  // Magnetic and Card Tilt Effects using event delegation
  useEffect(() => {
    const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (REDUCE) return;

    // Magnetic buttons handler
    const handleMagMouseMove = (e) => {
      const b = e.target.closest('.mag');
      if (!b) return;
      const r = b.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      b.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
    };

    const handleMagMouseLeave = (e) => {
      const b = e.target.closest('.mag');
      if (!b) return;
      b.style.transform = 'translate(0,0)';
    };

    // Card tilt handler
    const handleTiltMouseMove = (e) => {
      const c = e.target.closest('.tilt');
      if (!c) return;
      const r = c.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = `perspective(800px) rotateX(${-py * 8}deg) rotateY(${px * 8}deg) translateY(-4px)`;
    };

    const handleTiltMouseLeave = (e) => {
      const c = e.target.closest('.tilt');
      if (!c) return;
      c.style.transform = '';
    };

    document.addEventListener('mousemove', handleMagMouseMove);
    document.addEventListener('mouseout', handleMagMouseLeave);
    document.addEventListener('mousemove', handleTiltMouseMove);
    document.addEventListener('mouseout', handleTiltMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMagMouseMove);
      document.removeEventListener('mouseout', handleMagMouseLeave);
      document.removeEventListener('mousemove', handleTiltMouseMove);
      document.removeEventListener('mouseout', handleTiltMouseLeave);
    };
  }, [location.pathname]);

  return <canvas id="bg" ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', width: '100vw', height: '100vh' }} />;
};

export default ThreeBackground;
