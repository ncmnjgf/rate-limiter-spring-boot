import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function CanvasScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cap = 10;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0B1040, 0.02);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    
    while(containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x6677ff, 0.8));
    const L1 = new THREE.PointLight(0x3DE8FF, 2.2, 40);
    L1.position.set(-6, 4, 5);
    scene.add(L1);

    const L2 = new THREE.PointLight(0xFFB627, 2, 30);
    L2.position.set(2, 7, 4);
    scene.add(L2);

    const path = new THREE.CatmullRomCurve3([
      [-18,-1,-4],[-9,.8,-1.5],[-3,0,0],[3,0,0],[9,-.6,-1.5],[18,1,-4]
    ].map(a => new THREE.Vector3(...a)));

    scene.add(new THREE.Mesh(
      new THREE.TubeGeometry(path, 180, 0.8, 32, false),
      new THREE.MeshStandardMaterial({
        color: 0x9fdcff, transparent: true, opacity: 0.15, 
        roughness: 0.1, metalness: 0.3, side: THREE.DoubleSide, depthWrite: false
      })
    ));

    const rg = new THREE.TorusGeometry(0.85, 0.03, 8, 32);
    const rm = new THREE.MeshBasicMaterial({color: 0x3DE8FF, transparent: true, opacity: 0.55});

    function face(m: THREE.Mesh, u: number) {
      m.position.copy(path.getPointAt(u));
      m.lookAt(path.getPointAt(Math.min(u + 0.01, 1)));
    }

    for (let i = 0; i <= 44; i++) {
      const r = new THREE.Mesh(rg, rm);
      face(r, i / 44);
      scene.add(r);
    }

    const G = path.getPointAt(0.5);
    const gate = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.09, 12, 48),
      new THREE.MeshStandardMaterial({color: 0xFFB627, emissive: 0x8a5200, metalness: 0.7, roughness: 0.3})
    );
    face(gate, 0.5);
    scene.add(gate);

    const sh = new THREE.Mesh(
      new THREE.CircleGeometry(0.85, 32),
      new THREE.MeshBasicMaterial({color: 0xFF5A47, transparent: true, opacity: 0, side: THREE.DoubleSide})
    );
    face(sh, 0.5);
    sh.scale.setScalar(0.01);
    scene.add(sh);

    const glass = new THREE.MeshStandardMaterial({color: 0xbfe9ff, transparent: true, opacity: 0.2, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false});
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.3, 20, 1, true), glass);
    stem.position.set(G.x, 1.45, G.z);
    scene.add(stem);

    const bk = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.2, 2.9, 40, 1, true), glass);
    bk.position.set(G.x, 3.55, G.z);
    scene.add(bk);

    const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.4, 16), new THREE.MeshStandardMaterial({color: 0x8899cc, metalness: 0.9, roughness: 0.25}));
    tap.position.set(G.x, 6.6, G.z);
    scene.add(tap);

    const cg = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 28);
    const cm = new THREE.MeshStandardMaterial({color: 0xFFB627, emissive: 0x8a5200, metalness: 0.8, roughness: 0.3});
    
    const coins: THREE.Mesh[] = [];
    function addCoin(fall: boolean = false) {
      const i = coins.length;
      const m = new THREE.Mesh(cg, cm);
      const ty = 2.2 + i * 0.13;
      m.position.set(G.x + (Math.random() - 0.5) * 0.5, fall ? 7 : ty, G.z + (Math.random() - 0.5) * 0.5);
      m.rotation.set((Math.random() - 0.5) * 0.25, Math.random() * 3, 0);
      scene.add(m);
      coins.push(m);
      if (fall) gsap.to(m.position, {y: ty, duration: 0.8, ease: 'bounce.out'});
    }



    for(let i=0; i<cap; i++) addCoin();

    // Setup Camera Waypoints
    const cs = {px: -7, py: 3, pz: 12, tx: 2, ty: 1.5, tz: 0};
    const KF: Record<string, number[]> = {
      hero: [-7, 3, 12, 2, 1.5, 0],
      s1: [4, 4.6, 7, -1.6, 3.6, 0],
      s2: [4.5, 1.6, 5.5, -1.2, 0.3, 0],
      s3: [0.5, 1, 5.5, -1.6, 0.3, 0],
      try: [-1, 3.2, 16, -2, 1.6, 0]
    };

    function go(k: string) {
      const v = KF[k];
      gsap.to(cs, {px: v[0], py: v[1], pz: v[2], tx: v[3], ty: v[4], tz: v[5], duration: 1.8, ease: 'power3.inOut'});
    }

    Object.keys(KF).forEach(k => {
      ScrollTrigger.create({
        trigger: '#' + k,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: s => {
          if (s.isActive) {
            go(k);
          }
        }
      });
    });

    // Add back tok and coins manipulation
    const sg = new THREE.SphereGeometry(0.3, 18, 14);

    const handleSendAction = (e: Event) => {
      const allowed = (e as CustomEvent).detail.allowed;
      const isBurst = (e as CustomEvent).detail.burst;
      const m = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({color: allowed ? 0x3DE8FF : 0xFF5A47}));
      m.scale.set(1, 1, 2.4);
      scene.add(m);
      const o = {u: 0};
      const pl = () => face(m, Math.max(0, Math.min(o.u, 1)));

      // If it's a burst, duration is super fast (0.1s-0.2s), exactly like tollgate.html
      const travelSpeed = isBurst ? 0.2 : 1;
      
      gsap.to(o, {
        u: 0.46,
        duration: travelSpeed,
        ease: 'none',
        onUpdate: pl,
        onComplete: () => {
          if (allowed) {
            const coin = coins.pop();
            if (coin) {
              gsap.to(coin.position, {y: G.y, x: G.x, z: G.z, duration: 0.35, ease: 'power2.in'});
              gsap.to(coin.scale, {x: 0.1, y: 0.1, z: 0.1, duration: 0.35, onComplete: () => scene.remove(coin)});
            }
            // (m.material as THREE.MeshBasicMaterial).color.set(0x4DFFB0);
            gsap.to(o, {
              u: 1,
              duration: isBurst ? 0.3 : 1.1,
              ease: 'power1.in',
              onUpdate: pl,
              onComplete: () => scene.remove(m)
            });
          } else {
            gsap.to(o, {u: 0.25, duration: travelSpeed * 0.7, ease: 'back.out(2)', onUpdate: pl});
            gsap.to(m.scale, {x: 0.01, y: 0.01, z: 0.01, delay: travelSpeed * 0.6, duration: travelSpeed * 0.3, onComplete: () => scene.remove(m)});
            gsap.fromTo(sh.scale, {x: 1.25, y: 1.25}, {x: 1, y: 1, duration: travelSpeed * 0.4});
          }
        }
      });
    };

    const handleRefillAction = () => {
      if (coins.length < 10) addCoin(true);
    };

    window.addEventListener('send_request_anim', handleSendAction);
    const refillInterval = setInterval(handleRefillAction, 1000);

    let mx = 0, my = 0;
    const onPointerMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', onPointerMove);

    let animationId: number;
    const fr = () => {
      camera.position.set(cs.px + mx * 0.8, cs.py + my * 0.5, cs.pz);
      camera.lookAt(cs.tx, cs.ty, cs.tz);
      L1.position.x = -6 + Math.sin(Date.now() / 1500) * 3;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(fr);
    };
    fr();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('send_request_anim', handleSendAction);
      clearInterval(refillInterval);
      ScrollTrigger.getAll().forEach(t => t.kill());
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
}
