"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type AnomalyType = "none" | "redLight" | "shiftedDoor" | "missingPoster" | "tallSign";

type CorridorState = {
  anomaly: AnomalyType;
  hasAnomaly: boolean;
};

const GOAL = 8;

const ANOMALY_LABELS: Record<AnomalyType, string> = {
  none: "No anomaly",
  redLight: "Red light",
  shiftedDoor: "Shifted door",
  missingPoster: "Missing poster",
  tallSign: "Tall exit sign",
};

const nextCorridorState = (): CorridorState => {
  const anomalyPool: AnomalyType[] = ["redLight", "shiftedDoor", "missingPoster", "tallSign"];
  const hasAnomaly = Math.random() < 0.55;

  return {
    anomaly: hasAnomaly
      ? anomalyPool[Math.floor(Math.random() * anomalyPool.length)]
      : "none",
    hasAnomaly,
  };
};

export default function Exit8Page() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const corridorRef = useRef<{
    leftDoor: THREE.Mesh;
    rightDoor: THREE.Mesh;
    poster: THREE.Mesh;
    sign: THREE.Mesh;
    signFrame: THREE.Mesh;
    light: THREE.PointLight;
    figure: THREE.Group;
  } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const corridorStateRef = useRef<CorridorState>({ anomaly: "none", hasAnomaly: false });

  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState(
    "Observe the corridor. Go forward if everything looks normal. Turn back if you notice an anomaly.",
  );
  const [isWin, setIsWin] = useState(false);
  const [corridorState, setCorridorState] = useState<CorridorState>({ anomaly: "none", hasAnomaly: false });

  const distanceText = useMemo(() => `${progress} / ${GOAL}`, [progress]);
  const currentSampleText = useMemo(() => ANOMALY_LABELS[corridorState.anomaly], [corridorState.anomaly]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#05070b");
    scene.fog = new THREE.Fog("#05070b", 8, 24);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 1.8, 7.5);
    camera.lookAt(0, 1.8, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambient = new THREE.AmbientLight("#a8b0ff", 0.5);
    scene.add(ambient);

    const ceilingLight = new THREE.PointLight("#dbe4ff", 1.4, 20);
    ceilingLight.position.set(0, 3.8, 1.5);
    scene.add(ceilingLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 26),
      new THREE.MeshStandardMaterial({ color: "#2a2a2d", roughness: 0.95 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.position.z = -3;
    scene.add(floor);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 26),
      new THREE.MeshStandardMaterial({ color: "#1b1e27", roughness: 0.9 }),
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4.2;
    ceiling.position.z = -3;
    scene.add(ceiling);

    const leftWall = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 4.2),
      new THREE.MeshStandardMaterial({ color: "#d9ddd9", roughness: 0.92 }),
    );
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-4, 2.1, -3);
    scene.add(leftWall);

    const rightWall = leftWall.clone();
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(4, 2.1, -3);
    scene.add(rightWall);

    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 4.2),
      new THREE.MeshStandardMaterial({ color: "#cfd4d1", roughness: 0.9 }),
    );
    backWall.position.set(0, 2.1, -16);
    scene.add(backWall);

    for (let i = 0; i < 7; i += 1) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.02, 1.2),
        new THREE.MeshStandardMaterial({ color: "#e9eefc", emissive: "#cfd7ff", emissiveIntensity: 0.8 }),
      );
      strip.position.set(0, 4.05, 5 - i * 3);
      scene.add(strip);
    }

    const leftDoor = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 2.5, 0.15),
      new THREE.MeshStandardMaterial({ color: "#7a828b", roughness: 0.75 }),
    );
    leftDoor.position.set(-3.12, 1.25, -4.5);
    scene.add(leftDoor);

    const rightDoor = leftDoor.clone();
    rightDoor.position.set(3.12, 1.25, -6.2);
    scene.add(rightDoor);

    const poster = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 1.5),
      new THREE.MeshStandardMaterial({ color: "#f3f4f6", emissive: "#111827", emissiveIntensity: 0.02 }),
    );
    poster.position.set(3.88, 2.1, -2.9);
    poster.rotation.y = -Math.PI / 2;
    scene.add(poster);

    const signFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.45, 0.1),
      new THREE.MeshStandardMaterial({ color: "#d9f99d", emissive: "#9fef00", emissiveIntensity: 0.15 }),
    );
    signFrame.position.set(0, 3.35, -13.7);
    scene.add(signFrame);

    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.24),
      new THREE.MeshBasicMaterial({ color: "#14532d" }),
    );
    sign.position.set(0, 3.35, -13.64);
    scene.add(sign);

    const figure = new THREE.Group();
    const figureBody = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.56, 2.1, 6, 12),
      new THREE.MeshStandardMaterial({ color: "#05070b", roughness: 0.85 }),
    );
    figureBody.position.set(0, 2.15, -3.6);
    figure.add(figureBody);

    const figureHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.46, 20, 20),
      new THREE.MeshStandardMaterial({ color: "#0b0f16", roughness: 0.9 }),
    );
    figureHead.position.set(0, 3.8, -3.6);
    figure.add(figureHead);

    const figureShadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.05, 24),
      new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.28 }),
    );
    figureShadow.rotation.x = -Math.PI / 2;
    figureShadow.position.set(0, 0.02, -3.6);
    figure.add(figureShadow);
    figure.visible = false;
    scene.add(figure);

    corridorRef.current = {
      leftDoor,
      rightDoor,
      poster,
      sign,
      signFrame,
      light: ceilingLight,
      figure,
    };

    const resize = () => {
      if (!mount || !rendererRef.current || !cameraRef.current) {
        return;
      }

      cameraRef.current.aspect = mount.clientWidth / mount.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mount.clientWidth, mount.clientHeight);
    };

    const animate = () => {
      const currentRenderer = rendererRef.current;
      const currentScene = sceneRef.current;
      const currentCamera = cameraRef.current;
      const corridor = corridorRef.current;

      if (!currentRenderer || !currentScene || !currentCamera || !corridor) {
        return;
      }

      const elapsed = performance.now() * 0.001;
      currentCamera.position.x = Math.sin(elapsed * 0.45) * 0.03;
      currentCamera.position.y = 1.8 + Math.cos(elapsed * 0.8) * 0.02;
      currentCamera.lookAt(0, 1.8, -8);

      const isRedLight = corridorStateRef.current.anomaly === "redLight";
      const flicker = isRedLight ? 0.5 + Math.sin(elapsed * 18) * 0.35 : 1;
      corridor.light.intensity = 1.2 * flicker;
      corridor.figure.position.x = Math.sin(elapsed * 0.6) * 0.06;
      corridor.figure.visible = isRedLight && flicker < 0.42;
      currentRenderer.render(currentScene, currentCamera);
      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const corridor = corridorRef.current;
    if (!corridor) {
      return;
    }

    corridorStateRef.current = corridorState;

    corridor.leftDoor.position.set(-3.12, 1.25, -4.5);
    corridor.rightDoor.position.set(3.12, 1.25, -6.2);
    corridor.poster.visible = true;
    corridor.signFrame.scale.set(1, 1, 1);
    corridor.sign.scale.set(1, 1, 1);
    corridor.figure.visible = false;
    corridor.figure.position.set(0, 0, 0);
    corridor.light.color.set("#dbe4ff");

    switch (corridorState.anomaly) {
      case "redLight":
        corridor.light.color.set("#ff3b30");
        break;
      case "shiftedDoor":
        corridor.rightDoor.position.x = 2.2;
        corridor.rightDoor.position.z = -5.1;
        break;
      case "missingPoster":
        corridor.poster.visible = false;
        break;
      case "tallSign":
        corridor.signFrame.scale.y = 2.1;
        corridor.sign.scale.y = 2.1;
        corridor.signFrame.position.y = 3.7;
        corridor.sign.position.y = 3.7;
        break;
      default:
        corridor.signFrame.position.y = 3.35;
        corridor.sign.position.y = 3.35;
        break;
    }

    if (corridorState.anomaly !== "tallSign") {
      corridor.signFrame.position.y = 3.35;
      corridor.sign.position.y = 3.35;
    }
  }, [corridorState]);

  useEffect(() => {
    const initial = nextCorridorState();
    const timer = window.setTimeout(() => {
      corridorStateRef.current = initial;
      setCorridorState(initial);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const restart = () => {
    const fresh = nextCorridorState();
    corridorStateRef.current = fresh;
    setProgress(0);
    setAttempts(0);
    setIsWin(false);
    setStatus("New attempt. Observe carefully.");
    setCorridorState(fresh);
  };

  const submitChoice = (goForward: boolean) => {
    if (isWin) {
      return;
    }

    const current = corridorStateRef.current;
    const correct = current.hasAnomaly ? !goForward : goForward;

    setAttempts((value) => value + 1);

    if (!correct) {
      const fresh = nextCorridorState();
      corridorStateRef.current = fresh;
      setProgress(0);
      setStatus(
        current.hasAnomaly
          ? "You missed an anomaly and the loop reset."
          : "You turned back even though the corridor was normal.",
      );
      setCorridorState(fresh);
      return;
    }

    const nextProgress = progress + 1;
    if (nextProgress >= GOAL) {
      setProgress(GOAL);
      setIsWin(true);
      setStatus("Exit 8 reached. The corridor finally lets you go.");
      return;
    }

    const fresh = nextCorridorState();
    corridorStateRef.current = fresh;
    setProgress(nextProgress);
    setStatus(current.hasAnomaly ? "Correct. You turned back from an anomaly." : "Correct. No anomaly. Keep going.");
    setCorridorState(fresh);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1a1f31_0%,#0b1019_55%,#040507_100%)] px-3 py-3 pb-32 text-white sm:px-6 sm:py-8 sm:pb-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:gap-6">
        <section className="rounded-[26px] border border-white/10 bg-white/6 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur sm:rounded-[30px] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-200">
                3D Corridor Prototype
              </p>
              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Exit 8 Inspired</h1>
                <p className="max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                  A Three.js web prototype focused on observation, repeated corridors, and deciding
                  whether to proceed or turn back.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/8"
              >
                Home
              </Link>
              <button
                type="button"
                onClick={restart}
                className="inline-flex h-11 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-black text-stone-950 transition hover:bg-cyan-200"
              >
                Restart Loop
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-3 xl:grid-cols-[1.25fr_0.75fr] sm:gap-4">
          <div className="rounded-[26px] border border-white/10 bg-white/6 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur sm:rounded-[32px] sm:p-5">
            <div className="overflow-hidden rounded-[22px] border border-white/8 bg-black sm:rounded-[28px]">
              <div ref={mountRef} className="h-[280px] w-full sm:h-[520px]" />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            <section className="rounded-[26px] border border-white/10 bg-white/6 p-4 backdrop-blur sm:rounded-[30px] sm:p-5">
              <div className="flex flex-wrap gap-2 text-xs font-semibold sm:text-sm">
                <div className="rounded-full bg-white/8 px-3 py-2 sm:px-4">Distance {distanceText}</div>
                <div className="rounded-full bg-white/8 px-3 py-2 sm:px-4">Attempts {attempts}</div>
                <div className="rounded-full bg-white/8 px-3 py-2 sm:px-4">
                  Sample {currentSampleText}
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/72">{status}</p>
            </section>

            <section className="hidden rounded-[30px] border border-white/10 bg-white/6 p-5 backdrop-blur sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Decision
              </p>
              <h2 className="mt-2 text-2xl font-black">What do you do?</h2>
              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={() => submitChoice(true)}
                  className="inline-flex h-16 items-center justify-center rounded-[22px] bg-cyan-300 text-base font-black text-stone-950 transition active:scale-[0.98]"
                >
                  Proceed
                </button>
                <button
                  type="button"
                  onClick={() => submitChoice(false)}
                  className="inline-flex h-16 items-center justify-center rounded-[22px] border border-white/15 bg-white/8 text-base font-black text-white transition active:scale-[0.98]"
                >
                  Turn Back
                </button>
              </div>
            </section>

            <section className="rounded-[26px] border border-white/10 bg-white/6 p-4 backdrop-blur sm:rounded-[30px] sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Rule
              </p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-white/72">
                <p>Normal corridor: Proceed.</p>
                <p>Anything strange: Turn Back.</p>
                <p>Reach section 8 without mistakes.</p>
              </div>
            </section>
          </div>
        </section>

        <section className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#06080dcc] p-3 backdrop-blur sm:hidden">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => submitChoice(false)}
              className="inline-flex h-16 items-center justify-center rounded-[22px] border border-white/15 bg-white/8 text-base font-black text-white transition active:scale-[0.98]"
            >
              Turn Back
            </button>
            <button
              type="button"
              onClick={() => submitChoice(true)}
              className="inline-flex h-16 items-center justify-center rounded-[22px] bg-cyan-300 text-base font-black text-stone-950 transition active:scale-[0.98]"
            >
              Proceed
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
