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
      const R = 2.3;

      // Globe Wireframe
      const sphereGeo = new THREE.SphereGeometry(R, mobile ? 20 : 28, mobile ? 14 : 20);
      const wireframeGeo = new THREE.WireframeGeometry(sphereGeo);
      const lineMaterial = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.14 });
      const lineSegments = new THREE.LineSegments(wireframeGeo, lineMaterial);
      group.add(lineSegments);

      // Nodes
      const N = mobile ? 180 : 340;
      const pos = new Float32Array(N * 3);
      const nodes = [];
      const PHI = Math.PI * (3 - Math.sqrt(5));

      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const th = PHI * i;
        const x = Math.cos(th) * r;
        const z = Math.sin(th) * r;
        pos[i * 3] = x * R;
        pos[i * 3 + 1] = y * R;
        pos[i * 3 + 2] = z * R;
        nodes.push(new THREE.Vector3(x * R, y * R, z * R));
      }

      const pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pointsMat = new THREE.PointsMaterial({
        map: tex,
        color: GOLD2,
        size: 0.16,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const points = new THREE.Points(pg, pointsMat);
      group.add(points);

      // Connection Arcs
      const arcGeometries = [];
      const arcMaterials = [];
      const maxArcs = mobile ? 10 : 18;
      for (let k = 0; k < maxArcs; k++) {
        const a = nodes[Math.floor(Math.random() * N)];
        const b = nodes[Math.floor(Math.random() * N)];
        if (a.distanceTo(b) < 1.4) continue;
        const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R * 1.45);
        const cv = new THREE.QuadraticBezierCurve3(a, mid, b);
        const g = new THREE.BufferGeometry().setFromPoints(cv.getPoints(26));
        const mat = new THREE.LineBasicMaterial({
          color: GOLD2,
          transparent: true,
          opacity: 0.26,
          blending: THREE.AdditiveBlending,
        });
        const line = new THREE.Line(g, mat);
        group.add(line);
        arcGeometries.push(g);
        arcMaterials.push(mat);
      }

      // Central Glow Sprite
      const glowMat = new THREE.SpriteMaterial({
        map: tex,
        color: GOLD,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glow = new THREE.Sprite(glowMat);
      glow.scale.set(9, 9, 1);
      glow.position.z = -1;
      scene.add(glow);

      // Drifting Particles
      const PN = mobile ? 120 : 260;
      const pp = new Float32Array(PN * 3);
      for (let i = 0; i < PN; i++) {
        pp[i * 3] = (Math.random() - 0.5) * 18;
        pp[i * 3 + 1] = (Math.random() - 0.5) * 12;
        pp[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
      }
      const pgeo = new THREE.BufferGeometry();
      pgeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
      const dustMat = new THREE.PointsMaterial({
        map: tex,
        color: GOLD2,
        size: 0.07,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const dust = new THREE.Points(pgeo, dustMat);
      scene.add(dust);

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
        group.rotation.y += 0.0018;
        group.rotation.x += ((0.4 + mouse.y * 0.25) - group.rotation.x) * 0.05;
        group.rotation.z += (mouse.x * 0.05 - group.rotation.z) * 0.05;

        // Scroll drift and scaling
        const p = scrollProgress;
        group.position.x += (p * (window.innerWidth < 640 ? 0.4 : 2.6) - group.position.x) * 0.06;
        group.position.y += (p * 0.6 - group.position.y) * 0.06;

        const s = 1 - p * 0.18;
        group.scale.setScalar(s);

        glow.position.x = group.position.x;
        glowMat.opacity = 0.5 - p * 0.2;

        dust.rotation.y += 0.0006;
        dust.rotation.x = Math.sin(t * 0.1) * 0.05;

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
        scene.remove(glow);
        scene.remove(dust);

        sphereGeo.dispose();
        wireframeGeo.dispose();
        lineMaterial.dispose();
        pointsMat.dispose();
        pg.dispose();
        glowMat.dispose();
        pgeo.dispose();
        dustMat.dispose();
        tex.dispose();

        arcGeometries.forEach((g) => g.dispose());
        arcMaterials.forEach((m) => m.dispose());

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
