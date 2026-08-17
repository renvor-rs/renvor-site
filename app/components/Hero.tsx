'use client';

import { useEffect, useRef, useState } from 'react';
import type * as ThreeNamespace from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* Three.js is imported dynamically, inside the effect, and that is a deliberate size decision
   rather than a stylistic one.
 
   Statically imported it lands in the initial bundle: measured at **646 KB of the page's
   1.2 MB total JS**, for a decorative canvas that a reader may never scroll to and that has a
   complete non-WebGL fallback. Deferring it takes roughly half the JavaScript off the critical
   path — the copy, the lifecycle readout, and every control are usable while the scene is
   still arriving.
 
   The markup is unaffected: `Hero` still server-renders its heading, lead, actions, and the
   seven-stage readout. Only the renderer waits. `next/dynamic` with `ssr: false` would have
   been the obvious tool and is the wrong one here — it would stop that content being in the
   HTML at all, which is precisely what must not happen. */
type Three = typeof ThreeNamespace;

const STAGE_NAMES = ['Load', 'Validate', 'Register', 'Boot', 'Ready', 'Drain', 'Stop'];

/* Master geometry from the 160-unit Ordered Register master:
   billet width 12, gap 8, bottoms at y=142, tops left-to-right 106, 82, 54, 32, 36, 64, 94. */
const TOPS = [106, 82, 54, 32, 36, 64, 94];
const U = 0.052;
const HEIGHTS = TOPS.map((t) => (142 - t) * U);
const BILLET_W = 12 * U;
const PITCH = 20 * U;
const LIFT = 2.4; // ghost float height above the implied baseline

/* Device pixel ratio is capped at 2. Uncapped, a 3x phone renders 9x the fragments of a 1x
   display for a difference nobody can see, and the resulting GPU load is exactly what makes a
   decorative canvas drain a battery. */
const MAX_DPR = 2;

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Is a WebGL context obtainable at all?
 *
 * Asked **before** importing Three.js, and that ordering is the point. Without it, a browser
 * with no GPU — a hardened profile, a VM, a CI runner — downloads and parses 646 KB of a 3D
 * library purely to discover it cannot use it, then logs its own diagnostics on the way out.
 * That is wasted bandwidth and battery for the readers least able to spare either.
 *
 * It also removed a real class of CI failure: on GitHub's runners Firefox has no WebGL, so
 * Three.js emitted `THREE.WebGLRenderer: A WebGL context could not be created` to the console
 * on every navigation. The page behaved correctly — the fallback rendered — but a library
 * announcing an environment limitation is not a page defect, and a console-error assertion
 * cannot tell the difference. Not asking the question was the actual mistake.
 *
 * The probe canvas is never attached to the document, and its context is released immediately
 * via `WEBGL_lose_context` where the extension exists, so this cannot itself consume one of
 * the browser's limited live contexts.
 */
function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    if (!gl) return false;
    const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const readoutNameRef = useRef<HTMLSpanElement>(null);
  const stagesRef = useRef<HTMLOListElement>(null);

  // Drives the CSS-only fallback. It starts false so the server-rendered markup matches the
  // first client render; if WebGL turns out to be unavailable — or the context is lost later
  // — this flips and the section renders as a flat, styled register with no canvas at all.
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    if (!hero || !stage) return;

    // The dynamic import below is asynchronous, so the component can unmount before it
    // resolves. `cancelled` stops a late arrival from attaching a renderer to a detached node,
    // and `teardown` carries whatever cleanup the async path set up back to React's cleanup.
    let cancelled = false;
    let teardown: (() => void) | null = null;

    void (async () => {
      /* Wait for `load` before touching WebGL at all.
       *
       * This effect runs during hydration, which is before the `load` event. Creating a WebGL
       * context there puts GPU initialisation on the critical path — and on a machine with no
       * GPU, where the browser falls back to a software rasteriser, `getContext` can occupy
       * the main thread long enough to delay `load` itself. That is not theoretical: headless
       * Firefox on CI intermittently exceeded a 90-second navigation budget, always waiting on
       * `load`, always on a page that was otherwise fine.
       *
       * Deferring past `load` is also simply correct. A decorative canvas has no business
       * competing with the page's own rendering, and nothing here is needed for the hero to be
       * readable — the copy and the seven lifecycle stages are server-rendered text. */
      if (document.readyState !== 'complete') {
        await new Promise<void>((r) => window.addEventListener('load', () => r(), { once: true }));
      }
      if (cancelled) return;

      // Ask before paying. A browser without WebGL never downloads the 3D library at all.
      if (!webglAvailable()) {
        setWebglFailed(true);
        const els = stagesRef.current ? Array.from(stagesRef.current.querySelectorAll('li')) : [];
        // Resting state: every impression registered, matching reduced motion.
        els.forEach((el) => el.classList.add('is-stamped'));
        if (readoutNameRef.current) readoutNameRef.current.textContent = '— · holding';
        return;
      }

      let THREE: Three;
      try {
        THREE = await import('three');
      } catch {
        // The chunk failed to load — offline, blocked, or a transient network fault. Same
        // outcome as no WebGL: the fallback renders and the page is fully readable.
        if (!cancelled) setWebglFailed(true);
        return;
      }
      if (cancelled) return;
      teardown = start(THREE, hero, stage);
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };

    /**
     * Everything that needs Three.js. Returns its own cleanup.
     *
     * `hero` and `stage` are passed in rather than read from the refs again: TypeScript does
     * not carry a null-narrowing across a function boundary, and re-reading `.current` inside
     * would be a genuinely different value after an unmount.
     */
    function start(THREE: Three, hero: HTMLElement, stage: HTMLDivElement): () => void {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const stageEls = stagesRef.current ? Array.from(stagesRef.current.querySelectorAll('li')) : [];

      const applyStage = (active: number, stamped: number) => {
        stageEls.forEach((el, i) => {
          el.classList.toggle('is-stamped', i < stamped);
          el.classList.toggle('is-active', i === active);
        });
        if (readoutNameRef.current) {
          readoutNameRef.current.textContent =
            active >= 0 ? `${pad(active + 1)} · ${STAGE_NAMES[active]}` : '— · holding';
        }
      };

      /* ---------- renderer, guarded ----------
         `new THREE.WebGLRenderer` throws when no context can be created — a blocked or absent
         GPU, a hardened browser profile, or simply too many live contexts on the page. Left
         unguarded that throw escapes the effect and React unmounts the whole tree, taking the
         readable hero copy with it. The decoration must never be able to remove the content. */
      let renderer: ThreeNamespace.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      } catch {
        setWebglFailed(true);
        applyStage(-1, 7); // every impression registered: the same resting state as reduced motion
        return () => {};
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_DPR));
      stage.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
      const CAM_BASE = new THREE.Vector3(0, 2.5, 12.5);
      camera.position.copy(CAM_BASE);
      camera.lookAt(0, 1.6, 0);

      const ambient = new THREE.AmbientLight(0xf5f1e8, 0.55);
      scene.add(ambient);
      const key = new THREE.DirectionalLight(0xffffff, 1.5);
      key.position.set(3, 6, 4);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x97d8ba, 0.5);
      rim.position.set(-4, 3, -3);
      scene.add(rim);

      const group = new THREE.Group();
      scene.add(group);

      // Tracked explicitly so teardown can dispose them. Three.js does not free GPU buffers when
      // a mesh is garbage collected — an undisposed geometry leaks until the context dies.
      const geometries: ThreeNamespace.BufferGeometry[] = [];
      const materials: ThreeNamespace.Material[] = [];

      const billets = HEIGHTS.map((h, i) => {
        const geo = new THREE.BoxGeometry(BILLET_W, h, BILLET_W);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x075e78,
          roughness: 0.32,
          metalness: 0.12,
          transparent: true,
          opacity: 0.1,
          emissive: 0x075e78,
          emissiveIntensity: 0,
        });
        geometries.push(geo);
        materials.push(mat);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set((i - 3) * PITCH, h / 2 + LIFT, 0);
        group.add(mesh);
        return mesh;
      });

      const applyTheme = () => {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        const col = new THREE.Color(dark ? 0x70d6e5 : 0x075e78);
        billets.forEach((b) => {
          const m = b.material as ThreeNamespace.MeshStandardMaterial;
          m.color.copy(col);
          m.emissive.copy(col);
        });
        rim.color.set(dark ? 0x97d8ba : 0x3c6254);
      };
      applyTheme();
      const themeObserver = new MutationObserver(applyTheme);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });

      const layout = () => {
        const w = stage.clientWidth || window.innerWidth;
        const h = stage.clientHeight || window.innerHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        group.position.x = w >= 997 ? Math.min(3.6, w / 420) : 0;
        group.position.y = w >= 997 ? -0.9 : -2.6;
        group.scale.setScalar(w >= 997 ? Math.min(1, w / 1500) * 0.62 : 0.45);
      };
      layout();
      window.addEventListener('resize', layout);

      /* ---------- motion ---------- */
      let raf = 0;
      let loopTl: gsap.core.Timeline | null = null;
      let onScreen = true;
      const clock = new THREE.Clock();

      const renderFrame = () => {
        const t = clock.getElapsedTime();
        camera.position.x = CAM_BASE.x + Math.sin(t * 0.12) * 0.5;
        camera.position.y = CAM_BASE.y + Math.sin(t * 0.09) * 0.25;
        camera.lookAt(0, 1.6, 0);
        renderer.render(scene, camera);
      };

      const tick = () => {
        renderFrame();
        raf = requestAnimationFrame(tick);
      };
      const startRaf = () => {
        if (!raf && !reduced && onScreen && !document.hidden) raf = requestAnimationFrame(tick);
      };
      const stopRaf = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      };

      const onVisibility = () => {
        if (document.hidden) {
          stopRaf();
          loopTl?.pause();
        } else {
          startRaf();
          loopTl?.resume();
        }
      };

      // Scrolled past the hero, the canvas is invisible but would keep rendering every frame.
      // This stops the loop instead — the single largest saving on a long page.
      const visibility = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          onScreen = entry.isIntersecting;
          if (onScreen) {
            startRaf();
            loopTl?.resume();
          } else {
            stopRaf();
            loopTl?.pause();
          }
        },
        { threshold: 0 },
      );
      visibility.observe(hero);

      /* A lost context leaves a permanently blank canvas. Preventing the default event keeps
         the canvas alive for a possible restore, and either way the fallback takes over so the
         reader is never left looking at an empty box. */
      const onContextLost = (event: Event) => {
        event.preventDefault();
        stopRaf();
        loopTl?.pause();
        setWebglFailed(true);
        applyStage(-1, 7);
      };
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);

      const ctx = gsap.context(() => {
        if (reduced) {
          // Static proof: every impression already registered. One frame, no loop, no drift.
          billets.forEach((b, i) => {
            b.position.y = (HEIGHTS[i] ?? 0) / 2;
            const m = b.material as ThreeNamespace.MeshStandardMaterial;
            m.opacity = 1;
            m.emissiveIntensity = 0.06;
          });
          applyStage(-1, 7);
          renderer.render(scene, camera);
          return;
        }

        // Infinite register loop: stamp Load through Stop, hold, dissolve to ghosts, restart.
        loopTl = gsap.timeline({ repeat: -1, repeatDelay: 0.7 });
        const STAMP_GAP = 0.62;
        billets.forEach((b, i) => {
          const t0 = i * STAMP_GAP;
          const m = b.material as ThreeNamespace.MeshStandardMaterial;
          loopTl!.call(() => applyStage(i, i), [], t0);
          loopTl!.to(b.position, { y: (HEIGHTS[i] ?? 0) / 2, duration: 0.55, ease: 'expo.out' }, t0);
          loopTl!.to(m, { opacity: 1, duration: 0.45, ease: 'power2.out' }, t0);
          loopTl!.to(m, { emissiveIntensity: 0.6, duration: 0.15, ease: 'power1.in' }, t0 + 0.38);
          loopTl!.to(m, { emissiveIntensity: 0.06, duration: 0.35, ease: 'power2.out' }, t0 + 0.53);
          loopTl!.call(() => applyStage(i, i + 1), [], t0 + 0.5);
        });
        const dissolveAt = 6 * STAMP_GAP + 0.55 + 1.5; // brief hold, all stamped
        loopTl.call(() => applyStage(-1, 7), [], dissolveAt - 1.2);
        loopTl.to(
          billets.map((b) => b.material),
          { opacity: 0.1, duration: 0.7, ease: 'power2.inOut', stagger: 0.08 },
          dissolveAt,
        );
        loopTl.to(
          billets.map((b) => b.material),
          { emissiveIntensity: 0, duration: 0.5, ease: 'power2.inOut', stagger: 0.08 },
          dissolveAt,
        );
        loopTl.to(
          billets.map((b) => b.position),
          {
            y: (idx: number) => (HEIGHTS[idx] ?? 0) / 2 + LIFT,
            duration: 0.8,
            ease: 'power2.inOut',
            stagger: 0.08,
          },
          dissolveAt,
        );
        for (let k = 0; k < 7; k++) {
          loopTl.call(() => applyStage(-1, 6 - k), [], dissolveAt + 0.12 * (k + 1));
        }

        // Hero entrance. `gsap.from` means the authored state is the final state, so content is
        // never gated on JavaScript running.
        gsap
          .timeline({ defaults: { ease: 'power4.out' } })
          .from('[data-hero-line]', { yPercent: 115, duration: 1.1, stagger: 0.1, delay: 0.2 })
          .from('[data-hero-support]', { y: 26, opacity: 0, duration: 0.85, stagger: 0.09 }, '-=0.6');

        // Fade the scene away as the hero scrolls off.
        gsap.to(stage, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 35%', scrub: true },
        });

        startRaf();
      }, hero);

      document.addEventListener('visibilitychange', onVisibility);

      return () => {
        document.removeEventListener('visibilitychange', onVisibility);
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        visibility.disconnect();
        themeObserver.disconnect();
        window.removeEventListener('resize', layout);
        stopRaf();
        ctx.revert();
        loopTl?.kill();

        // Free GPU memory explicitly. Three.js frees none of this on garbage collection, and a
        // leaked context is what eventually makes `new WebGLRenderer` start throwing.
        geometries.forEach((g) => g.dispose());
        materials.forEach((m) => m.dispose());
        scene.clear();
        renderer.dispose();
        renderer.forceContextLoss();
        if (renderer.domElement.parentNode === stage) stage.removeChild(renderer.domElement);
      };
    }
  }, []);

  return (
    <section
      className={`hero${webglFailed ? ' hero-no-webgl' : ''}`}
      ref={heroRef}
      data-hero
    >
      {/* Decorative only. Everything it depicts is also present as text in the register
          readout below, so a reader who never sees the canvas loses nothing. */}
      <div className="hero-stage" ref={stageRef} aria-hidden="true" />

      <div className="hero-inner">
        <p className="hero-proof mono" data-hero-support>
          running register / application infrastructure / rust
        </p>
        <h1 aria-label="Application infrastructure for complete Rust systems">
          <span className="hero-line" aria-hidden="true">
            <i data-hero-line>Application infrastructure</i>
          </span>
          <span className="hero-line" aria-hidden="true">
            <i data-hero-line>
              for complete <em>Rust</em> systems.
            </i>
          </span>
        </h1>
        <p className="hero-lead" data-hero-support>
          The plan: generate the backend, typed client, authentication, desktop shell, operating
          contracts, and package boundaries as one inspectable application.{' '}
          <strong>
            Phase 002 has delivered the core those pieces attach to — a tested,
            transport-independent kernel. Everything else on this page is still a design.
          </strong>
        </p>
        <div className="actions" data-hero-support>
          <a className="btn-primary" href="https://github.com/renvor-rs/renvor">
            Read the source →
          </a>
          <a className="btn-secondary" href="/#panorama">
            Tour the design ↗
          </a>
        </div>
      </div>

      <div className="register-readout" data-hero-support>
        <div className="readout-head">
          <span className="readout-title mono">lifecycle register</span>
          <span className="readout-stage mono" ref={readoutNameRef}>
            — · standby
          </span>
        </div>
        <ol className="register-stages" aria-label="Lifecycle stages" ref={stagesRef}>
          {STAGE_NAMES.map((name, i) => (
            <li key={name} className="mono">
              <i>{pad(i + 1)}</i>
              {name}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
