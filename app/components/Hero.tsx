'use client';

import { useEffect, useRef, useState } from 'react';
import type * as ThreeNamespace from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { continuousMotionIsPaused, MOTION_ATTRIBUTE } from '../lib/motionPreference';
import { RAIL_KNOT_V40_LAYER_COUNT, RAIL_KNOT_V40_SVG } from '../lib/railKnotV40';

gsap.registerPlugin(ScrollTrigger);

type Three = typeof ThreeNamespace;
type SVGLoaderClass = typeof import('three/addons/loaders/SVGLoader.js').SVGLoader;

const STAGE_NAMES = ['Load', 'Validate', 'Register', 'Boot', 'Ready', 'Drain', 'Stop'];
const MAX_DPR = 2;
const WEAVE_DEPTHS = [0, 0.45, 0.78, 1.12] as const;
const pad = (value: number) => String(value).padStart(2, '0');

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    // Three r185's WebGLRenderer is WebGL2-only. Accepting a WebGL1 context here would pass
    // the capability gate, download Three, and then fail a second time in the renderer.
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;
    const lose = gl.getExtension('WEBGL_lose_context');
    lose?.loseContext();
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
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    if (!hero || !stage) return;

    let cancelled = false;
    let teardown: (() => void) | null = null;

    void (async () => {
      if (document.readyState !== 'complete') {
        await new Promise<void>((resolve) =>
          window.addEventListener('load', () => resolve(), { once: true }),
        );
      }
      if (cancelled) return;

      if (!webglAvailable()) {
        setWebglFailed(true);
        const stageElements = stagesRef.current
          ? Array.from(stagesRef.current.querySelectorAll('li'))
          : [];
        stageElements.forEach((element) => element.classList.add('is-stamped'));
        if (readoutNameRef.current) readoutNameRef.current.textContent = 'routes held';
        return;
      }

      let THREE: Three;
      let SVGLoader: SVGLoaderClass;
      try {
        [THREE, { SVGLoader }] = await Promise.all([
          import('three'),
          import('three/addons/loaders/SVGLoader.js'),
        ]);
      } catch {
        if (!cancelled) setWebglFailed(true);
        return;
      }
      if (cancelled) return;
      try {
        teardown = start(THREE, SVGLoader, hero, stage);
      } catch {
        if (!cancelled) setWebglFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };

    function start(
      THREE: Three,
      SVGLoader: SVGLoaderClass,
      hero: HTMLElement,
      stage: HTMLDivElement,
    ): () => void {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const stageElements = stagesRef.current
        ? Array.from(stagesRef.current.querySelectorAll('li'))
        : [];

      const applyStage = (active: number, completed: number) => {
        stageElements.forEach((element, index) => {
          element.classList.toggle('is-stamped', index < completed);
          element.classList.toggle('is-active', index === active);
        });
        if (readoutNameRef.current) {
          readoutNameRef.current.textContent =
            active >= 0 ? `${pad(active + 1)} / ${STAGE_NAMES[active]}` : 'routes held';
        }
      };

      let renderer: ThreeNamespace.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'low-power',
        });
      } catch {
        setWebglFailed(true);
        applyStage(-1, STAGE_NAMES.length);
        return () => {};
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_DPR));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.dataset.loopMode = 'route-separation';
      renderer.domElement.dataset.weavePhase = '0.000';
      renderer.domElement.dataset.signalTravel = '0.000';
      renderer.domElement.dataset.logoScale = '1.000';
      stage.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-4.4, 4.4, 4.4, -4.4, 0.1, 50);
      camera.position.set(0, 0, 12);
      camera.lookAt(0, 0, 0);

      const ambient = new THREE.AmbientLight(0xffffff, 1.9);
      const key = new THREE.DirectionalLight(0xffffff, 3.1);
      key.position.set(2.5, 4.5, 8);
      const fill = new THREE.DirectionalLight(0xf0c400, 0.75);
      fill.position.set(-4, -2, 5);
      scene.add(ambient, key, fill);

      const geometries: ThreeNamespace.BufferGeometry[] = [];
      const materials: ThreeNamespace.Material[] = [];

      const parsedMark = new SVGLoader().parse(RAIL_KNOT_V40_SVG);
      if (parsedMark.paths.length !== RAIL_KNOT_V40_LAYER_COUNT) {
        renderer.dispose();
        renderer.forceContextLoss();
        stage.removeChild(renderer.domElement);
        setWebglFailed(true);
        applyStage(-1, STAGE_NAMES.length);
        return () => {};
      }

      const orbitField = new THREE.Group();
      // Keep the approved silhouette almost perfectly front-facing. The fixed micro-angle
      // reveals the extrusion without the warped frames produced by a continuous orbit.
      orbitField.rotation.set(-0.018, -0.028, 0);
      scene.add(orbitField);

      const markRoot = new THREE.Group();
      orbitField.add(markRoot);

      // The entrance timeline owns markRoot. Continuous motion lives one level lower so the
      // two animation systems never compete for the same transform.
      const motionRoot = new THREE.Group();
      markRoot.add(motionRoot);

      const markArt = new THREE.Group();
      markArt.scale.set(0.054, -0.054, 0.054);
      motionRoot.add(markArt);

      const centeredArtwork = new THREE.Group();
      centeredArtwork.position.set(-60, -61.5, -4.2);
      markArt.add(centeredArtwork);

      const bodyFrontMaterial = new THREE.MeshBasicMaterial({
        color: 0x171811,
      });
      const bodySideMaterial = new THREE.MeshStandardMaterial({
        color: 0x35362f,
        roughness: 0.43,
        metalness: 0.06,
      });
      const signalRailFrontMaterial = new THREE.MeshBasicMaterial({
        color: 0xf0c400,
      });
      const signalRailSideMaterial = new THREE.MeshStandardMaterial({
        color: 0xf0c400,
        emissive: 0xf0c400,
        emissiveIntensity: 0.08,
        roughness: 0.36,
        metalness: 0.04,
      });
      const separatorFrontMaterial = new THREE.MeshBasicMaterial({
        color: 0xf5f6f2,
      });
      const separatorSideMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5f6f2,
        roughness: 0.5,
        metalness: 0,
      });
      materials.push(
        bodyFrontMaterial,
        bodySideMaterial,
        signalRailFrontMaterial,
        signalRailSideMaterial,
        separatorFrontMaterial,
        separatorSideMaterial,
      );

      const layerMaterials: [
        ThreeNamespace.Material[],
        ThreeNamespace.Material[],
        ThreeNamespace.Material[],
        ThreeNamespace.Material[],
      ] = [
        [bodyFrontMaterial, bodySideMaterial],
        [signalRailFrontMaterial, signalRailSideMaterial],
        [separatorFrontMaterial, separatorSideMaterial],
        [bodyFrontMaterial, bodySideMaterial],
      ];
      const layerDepths = [3.4, 3, 1, 2.6] as const;
      const layerOffsets = [0, 3.15, 5.95, 6.65] as const;
      const layerGroups: ThreeNamespace.Group[] = [];
      const layerMotionGroups: ThreeNamespace.Group[] = [];

      parsedMark.paths.forEach((path, index) => {
        const layerIndex = index as 0 | 1 | 2 | 3;
        const shapes = path.toShapes();
        if (!shapes.length) throw new Error(`Rail Knot layer ${index + 1} has no drawable shape.`);

        const geometry = new THREE.ExtrudeGeometry(shapes, {
          depth: layerDepths[layerIndex],
          bevelEnabled: false,
          curveSegments: 24,
        });
        const layer = new THREE.Group();
        const motionLayer = new THREE.Group();
        const mesh = new THREE.Mesh(geometry, layerMaterials[layerIndex]);
        layer.position.z = layerOffsets[layerIndex];
        motionLayer.add(mesh);
        layer.add(motionLayer);
        centeredArtwork.add(layer);
        geometries.push(geometry);
        layerGroups.push(layer);
        layerMotionGroups.push(motionLayer);
      });
      const signalRailMotion = layerMotionGroups[1];
      if (!signalRailMotion) throw new Error('Rail Knot signal layer is unavailable.');

      const applyTheme = () => {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        bodyFrontMaterial.color.set(dark ? 0xf5f6f2 : 0x171811);
        bodySideMaterial.color.set(dark ? 0xc8cabf : 0x35362f);
        separatorFrontMaterial.color.set(dark ? 0x171811 : 0xf5f6f2);
        separatorSideMaterial.color.set(dark ? 0x2a2b22 : 0xd8dad1);
      };
      applyTheme();

      const layout = () => {
        const width = stage.clientWidth || 1;
        const height = stage.clientHeight || 1;
        renderer.setSize(width, height, false);
        const aspect = width / height;
        const halfHeight = width < 620 ? 4.35 : 3.95;
        camera.left = -halfHeight * aspect;
        camera.right = halfHeight * aspect;
        camera.top = halfHeight;
        camera.bottom = -halfHeight;
        camera.updateProjectionMatrix();
      };
      layout();
      window.addEventListener('resize', layout);

      const signalState = { progress: reduced ? 0.62 : 0 };
      let loopTimeline: gsap.core.Timeline | null = null;
      let raf = 0;
      let onScreen = true;
      let lastStage = -1;
      let reducedFrameCount = 0;
      let motionFrameCount = 0;
      let loopSeconds = 0;
      let previousTick = performance.now();

      const renderFrame = () => {
        const time = loopSeconds;
        if (!reduced) {
          // The weave opens only toward the camera, then reconnects to the exact master.
          // Every offset is non-negative and increases with the canonical layer order, so
          // the R/V crossing can never invert. The base groups remain owned by the GSAP intro.
          const weavePulse = Math.pow(0.5 - 0.5 * Math.cos(time * 0.82), 1.35);
          layerMotionGroups.forEach((layer, index) => {
            layer.position.z = weavePulse * (WEAVE_DEPTHS[index] ?? 0);
          });
          // Let the signal rail visibly leave the junction along its own diagonal, then
          // return to the exact frozen master. Only the yellow V receives planar travel;
          // the other layers keep their approved x/y geometry and depth order.
          const signalX = weavePulse * 2.4;
          const signalY = weavePulse * 3.6;
          const logoScale = 1 + weavePulse * 0.03;
          signalRailMotion.position.set(signalX, signalY, weavePulse * WEAVE_DEPTHS[1]);
          motionRoot.scale.setScalar(logoScale);

          // A slow key-light pass reveals the changing depth without rotating the mark.
          key.position.x = Math.sin(time * 0.46) * 4.4;
          key.position.y = 4.35 + Math.cos(time * 0.46) * 0.42;
          signalRailSideMaterial.emissiveIntensity = 0.07 + weavePulse * 0.12;

          motionFrameCount += 1;
          if (motionFrameCount % 12 === 0) {
            renderer.domElement.dataset.loopFrame = String(motionFrameCount);
            renderer.domElement.dataset.weavePhase = weavePulse.toFixed(3);
            renderer.domElement.dataset.signalTravel = Math.hypot(signalX, signalY).toFixed(3);
            renderer.domElement.dataset.logoScale = logoScale.toFixed(3);
          }
        }
        const stageIndex = Math.min(6, Math.floor(signalState.progress * 7));
        if (!reduced && stageIndex !== lastStage) {
          lastStage = stageIndex;
          applyStage(stageIndex, stageIndex);
        }
        renderer.render(scene, camera);
        if (reduced) {
          reducedFrameCount += 1;
          renderer.domElement.dataset.staticFrame = String(reducedFrameCount);
          renderer.domElement.dataset.staticTheme =
            document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        }
      };

      const tick = (now: number) => {
        loopSeconds += Math.min(Math.max((now - previousTick) / 1_000, 0), 0.05);
        previousTick = now;
        renderFrame();
        raf = requestAnimationFrame(tick);
      };
      const startRaf = () => {
        if (!raf && !reduced && onScreen && !document.hidden && !continuousMotionIsPaused()) {
          previousTick = performance.now();
          raf = requestAnimationFrame(tick);
        }
      };
      const stopRaf = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      };

      const updatePlayback = () => {
        const shouldPlay = onScreen && !document.hidden && !continuousMotionIsPaused();
        renderer.domElement.dataset.motionState = shouldPlay ? 'running' : 'paused';
        if (!shouldPlay) {
          stopRaf();
          loopTimeline?.pause();
        } else {
          startRaf();
          loopTimeline?.resume();
        }
      };

      const preferencesObserver = new MutationObserver((records) => {
        if (records.some((record) => record.attributeName === 'data-theme')) {
          applyTheme();
          // A paused or reduced-motion canvas has no RAF loop. Theme changes need one fresh
          // frame so the mounted scene does not retain its previous palette.
          if (reduced || continuousMotionIsPaused()) renderFrame();
        }
        if (records.some((record) => record.attributeName === MOTION_ATTRIBUTE)) {
          updatePlayback();
        }
      });
      preferencesObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', MOTION_ATTRIBUTE],
      });

      const visibility = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          onScreen = entry.isIntersecting;
          updatePlayback();
        },
        { threshold: 0 },
      );
      visibility.observe(hero);

      const onContextLost = (event: Event) => {
        event.preventDefault();
        stopRaf();
        loopTimeline?.pause();
        setWebglFailed(true);
        applyStage(-1, STAGE_NAMES.length);
      };
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);

      const ctx = gsap.context(() => {
        if (reduced) {
          applyStage(-1, STAGE_NAMES.length);
          renderFrame();
          return;
        }

        loopTimeline = gsap
          .timeline({ paused: true, repeat: -1, repeatDelay: 0.7 })
          .set(signalState, { progress: 0 })
          .to(signalState, { progress: 1, duration: 8.4, ease: 'none' })
          .call(() => applyStage(-1, STAGE_NAMES.length));

        gsap
          .timeline({ defaults: { ease: 'power4.out' } })
          .from('[data-hero-brand]', { opacity: 0, y: 16, duration: 0.7, delay: 0.12 })
          .from('[data-hero-line]', { yPercent: 112, duration: 1.05, stagger: 0.1 }, '-=0.35')
          .from('[data-hero-support]', { opacity: 0, y: 24, duration: 0.78, stagger: 0.08 }, '-=0.5')
          .from(stage, { opacity: 0, scale: 0.96, duration: 1.2 }, '-=1.05')
          .from(markRoot.scale, { x: 0.88, y: 0.88, z: 0.88, duration: 1.1 }, '-=1.15')
          .from(
            layerGroups.map((layer) => layer.position),
            { z: '-=3', duration: 1.15, stagger: 0.06 },
            '-=1.1',
          );

        gsap.to(stage, {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom 30%',
            scrub: true,
          },
        });

        updatePlayback();
      }, hero);
      document.addEventListener('visibilitychange', updatePlayback);

      return () => {
        document.removeEventListener('visibilitychange', updatePlayback);
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        visibility.disconnect();
        preferencesObserver.disconnect();
        window.removeEventListener('resize', layout);
        stopRaf();
        loopTimeline?.kill();
        ctx.revert();
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((material) => material.dispose());
        scene.clear();
        renderer.dispose();
        renderer.forceContextLoss();
        if (renderer.domElement.parentNode === stage) stage.removeChild(renderer.domElement);
      };
    }
  }, []);

  return (
    <section className={`hero${webglFailed ? ' hero-no-webgl' : ''}`} ref={heroRef} data-hero>
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="hero-brand" data-hero-brand>
            {/* The frozen V40 Rail Knot master is used unchanged in both the flat and 3D forms. */}
            {/* eslint-disable @next/next/no-img-element */}
            <img
              className="only-light"
              src="/assets/renvor-mark-v40-light.svg"
              alt=""
              width={120}
              height={123}
            />
            <img
              className="only-dark"
              src="/assets/renvor-mark-v40-dark.svg"
              alt=""
              width={120}
              height={123}
            />
            {/* eslint-enable @next/next/no-img-element */}
            <span className="mono">In development / prerelease</span>
          </div>

          <h1 aria-label="Two routes. One junction.">
            <span className="hero-line" aria-hidden="true">
              <i data-hero-line>Two routes.</i>
            </span>
            <span className="hero-line" aria-hidden="true">
              <i data-hero-line>One junction.</i>
            </span>
          </h1>

          <p className="hero-lead" data-hero-support>
            Visible routes. Explicit ownership. Renvor is shaping application infrastructure for
            Rust teams around a tested transport-independent kernel.
          </p>
          <p className="hero-caveat" data-hero-support>
            The kernel, CLI, HTTP transport, validation, persistence adapters, and authentication
            paths run in workspace tests. No crate is published; the facade does not expose
            persistence or authentication, and generated clients do not exist.
          </p>
          <div className="actions" data-hero-support>
            <a className="btn-primary" href="https://github.com/renvor-rs/renvor">
              Read the source
            </a>
            <a className="btn-secondary" href="/#panorama">
              Trace the design
            </a>
          </div>
        </div>

        <div
          className="hero-visual"
          role="img"
          aria-label="Three-dimensional Renvor Rail Knot R and V logo"
          data-hero-identity="rail-knot-v40"
        >
          <div className="hero-stage" ref={stageRef} aria-hidden="true" />
          <div className="hero-fallback" aria-hidden="true">
            {/* eslint-disable @next/next/no-img-element */}
            <img
              className="hero-fallback-mark only-light"
              src="/assets/renvor-mark-v40-light.svg"
              alt=""
              width={540}
              height={554}
            />
            <img
              className="hero-fallback-mark only-dark"
              src="/assets/renvor-mark-v40-dark.svg"
              alt=""
              width={540}
              height={554}
            />
            {/* eslint-enable @next/next/no-img-element */}
          </div>
          <div className="scene-caption mono">
            <span>R rail / structural</span>
            <span>weave / explicit</span>
            <span>V rail / signal</span>
          </div>
        </div>

        <div className="register-readout" data-hero-support>
          <div className="readout-head">
            <span className="readout-title mono">kernel lifecycle</span>
            <span className="readout-stage mono" ref={readoutNameRef}>
              routes ready
            </span>
          </div>
          <ol className="register-stages" aria-label="Lifecycle stages" ref={stagesRef}>
            {STAGE_NAMES.map((name, index) => (
              <li key={name} className="mono">
                <i>{pad(index + 1)}</i>
                {name}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
