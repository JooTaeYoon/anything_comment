"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Obstacle = {
  id: number;
  x: number;
  width: number;
  height: number;
};

type GameSnapshot = {
  playerY: number;
  score: number;
  speed: number;
  obstacles: Obstacle[];
  isRunning: boolean;
  isGameOver: boolean;
};

const GAME_WIDTH = 920;
const GROUND_HEIGHT = 88;
const PLAYER_SIZE = 54;
const PLAYER_X = 120;
const JUMP_POWER = 18;
const GRAVITY = 0.9;
const BASE_SPEED = 7;
const MAX_SPEED = 16;
const STORAGE_KEY = "nom-best-score";

const readBestScore = () => {
  if (typeof window === "undefined") {
    return 0;
  }

  const storedBest = window.localStorage.getItem(STORAGE_KEY);
  const parsedBest = storedBest ? Number.parseInt(storedBest, 10) : 0;

  return Number.isFinite(parsedBest) ? parsedBest : 0;
};

export default function NomPage() {
  const [bestScore, setBestScore] = useState(readBestScore);
  const [snapshot, setSnapshot] = useState<GameSnapshot>({
    playerY: 0,
    score: 0,
    speed: BASE_SPEED,
    obstacles: [],
    isRunning: false,
    isGameOver: false,
  });

  const playerYRef = useRef(0);
  const velocityRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const spawnTimerRef = useRef(0);
  const obstacleIdRef = useRef(0);
  const runningRef = useRef(false);
  const scoreRef = useRef(0);
  const speedRef = useRef(BASE_SPEED);
  const bestScoreRef = useRef(readBestScore());
  const gameOverRef = useRef(false);

  const syncSnapshot = useCallback((overrides?: Partial<GameSnapshot>) => {
    gameOverRef.current = overrides?.isGameOver ?? false;

    setSnapshot({
      playerY: playerYRef.current,
      score: scoreRef.current,
      speed: speedRef.current,
      obstacles: [...obstaclesRef.current],
      isRunning: runningRef.current,
      isGameOver: overrides?.isGameOver ?? false,
      ...overrides,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const finishRun = useCallback(() => {
    runningRef.current = false;

    if (scoreRef.current > bestScoreRef.current) {
      bestScoreRef.current = scoreRef.current;
      setBestScore(scoreRef.current);
      window.localStorage.setItem(STORAGE_KEY, String(scoreRef.current));
    }

    syncSnapshot({
      isRunning: false,
      isGameOver: true,
    });
  }, [syncSnapshot]);

  const spawnObstacle = useCallback(() => {
    const width = 24 + Math.random() * 24;
    const height = 30 + Math.random() * 60;

    obstaclesRef.current = [
      ...obstaclesRef.current,
      {
        id: obstacleIdRef.current++,
        x: GAME_WIDTH + width,
        width,
        height,
      },
    ];
  }, []);

  const tick = useCallback(function tickFrame(timestamp: number) {
    if (!runningRef.current) {
      return;
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = timestamp;
      animationRef.current = window.requestAnimationFrame(tickFrame);
      return;
    }

    const delta = Math.min(32, timestamp - lastTimeRef.current);
    lastTimeRef.current = timestamp;

    velocityRef.current -= GRAVITY * (delta / 16);
    playerYRef.current = Math.max(0, playerYRef.current + velocityRef.current * (delta / 16));

    if (playerYRef.current === 0 && velocityRef.current < 0) {
      velocityRef.current = 0;
    }

    speedRef.current = Math.min(MAX_SPEED, BASE_SPEED + scoreRef.current / 180);
    scoreRef.current += delta * 0.06;
    spawnTimerRef.current += delta;

    const spawnInterval = Math.max(520, 1040 - scoreRef.current * 0.9);
    if (spawnTimerRef.current >= spawnInterval) {
      spawnTimerRef.current = 0;
      spawnObstacle();
    }

    obstaclesRef.current = obstaclesRef.current
      .map((obstacle) => ({
        ...obstacle,
        x: obstacle.x - speedRef.current * (delta / 16),
      }))
      .filter((obstacle) => obstacle.x + obstacle.width > -20);

    const playerBottom = GROUND_HEIGHT + playerYRef.current;
    const playerLeft = PLAYER_X;
    const playerRight = PLAYER_X + PLAYER_SIZE;

    const hitObstacle = obstaclesRef.current.some((obstacle) => {
      const obstacleLeft = obstacle.x;
      const obstacleRight = obstacle.x + obstacle.width;
      const obstacleTop = GROUND_HEIGHT + obstacle.height;

      const overlapsX = playerRight > obstacleLeft && playerLeft < obstacleRight;
      const overlapsY = playerBottom < obstacleTop;

      return overlapsX && overlapsY;
    });

    if (hitObstacle) {
      finishRun();
      return;
    }

    syncSnapshot();
    animationRef.current = window.requestAnimationFrame(tickFrame);
  }, [finishRun, spawnObstacle, syncSnapshot]);

  const startGame = () => {
    if (animationRef.current !== null) {
      window.cancelAnimationFrame(animationRef.current);
    }

    playerYRef.current = 0;
    velocityRef.current = 0;
    obstaclesRef.current = [];
    scoreRef.current = 0;
    speedRef.current = BASE_SPEED;
    spawnTimerRef.current = 200;
    lastTimeRef.current = null;
    runningRef.current = true;

    syncSnapshot({
      isRunning: true,
      isGameOver: false,
    });

    animationRef.current = window.requestAnimationFrame(tick);
  };

  const jump = () => {
    if (!runningRef.current) {
      startGame();
      return;
    }

    if (playerYRef.current === 0) {
      velocityRef.current = JUMP_POWER;
    }
  };

  useEffect(() => {
    const beginRun = () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }

      playerYRef.current = 0;
      velocityRef.current = 0;
      obstaclesRef.current = [];
      scoreRef.current = 0;
      speedRef.current = BASE_SPEED;
      spawnTimerRef.current = 200;
      lastTimeRef.current = null;
      runningRef.current = true;
      gameOverRef.current = false;

      syncSnapshot({
        isRunning: true,
        isGameOver: false,
      });

      animationRef.current = window.requestAnimationFrame(tick);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp" || event.code === "KeyW") {
        event.preventDefault();

        if (!runningRef.current) {
          beginRun();
          return;
        }

        if (playerYRef.current === 0) {
          velocityRef.current = JUMP_POWER;
        }
      }

      if (event.code === "KeyR" && gameOverRef.current) {
        event.preventDefault();
        beginRun();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [syncSnapshot, tick]);

  const roundedScore = Math.floor(snapshot.score);
  const skylineOffset = -(roundedScore * 0.6) % 240;

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fff4cc_0%,#ffd074_22%,#ff9a3d_55%,#18181b_100%)] px-4 py-8 text-stone-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[32px] border border-white/30 bg-black/25 p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.28)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-amber-200">
                Flash Runner
              </p>
              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight md:text-6xl">NOM</h1>
                <p className="max-w-2xl text-sm leading-6 text-white/78 md:text-base">
                  Old-school flash runner inspired by the classic one-button Korean browser game.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/35 px-5 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Home
              </Link>
              <button
                type="button"
                onClick={startGame}
                className="inline-flex h-11 items-center justify-center rounded-full bg-amber-300 px-5 text-sm font-black text-stone-950 transition hover:bg-amber-200"
              >
                {snapshot.isRunning ? "Restart" : "Start Game"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/25 bg-black/35 p-4 shadow-[0_25px_100px_rgba(0,0,0,0.28)] backdrop-blur md:p-6">
          <div
            className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[linear-gradient(180deg,#2f4858_0%,#193244_45%,#0b1620_100%)]"
            onPointerDown={jump}
          >
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,#fff7d6_0%,#ffd788_18%,transparent_62%)] opacity-85" />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-[88px] h-28 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent 0, transparent 12px, rgba(255,255,255,0.18) 12px, rgba(255,255,255,0.18) 16px, transparent 16px, transparent 48px)",
                backgroundSize: "240px 100%",
                transform: `translateX(${skylineOffset}px)`,
              }}
            />
            <div className="relative h-[420px] w-full">
              <div className="absolute left-5 top-5 z-20 flex flex-wrap gap-3 text-sm font-semibold text-white">
                <div className="rounded-full bg-white/12 px-4 py-2 backdrop-blur">
                  Score {roundedScore}
                </div>
                <div className="rounded-full bg-white/12 px-4 py-2 backdrop-blur">
                  Best {bestScore}
                </div>
                <div className="rounded-full bg-white/12 px-4 py-2 backdrop-blur">
                  Speed {snapshot.speed.toFixed(1)}
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-[88px] h-[2px] bg-white/30" />

              <div
                className="absolute bottom-[88px] left-[120px] z-10 flex items-end justify-center"
                style={{
                  width: `${PLAYER_SIZE}px`,
                  height: `${PLAYER_SIZE}px`,
                  transform: `translateY(${-snapshot.playerY}px)`,
                }}
              >
                <div className="absolute bottom-0 h-[18px] w-[42px] rounded-full bg-black/25 blur-md" />
                <div className="relative h-[54px] w-[42px]">
                  <div className="absolute left-3 top-0 h-4 w-4 rounded-full bg-[#fff2d6]" />
                  <div className="absolute left-1 top-3 h-8 w-10 rounded-[16px] bg-[#f3f4f6]" />
                  <div className="absolute right-2 top-5 h-1.5 w-1.5 rounded-full bg-stone-950" />
                  <div className="absolute left-2 bottom-0 h-5 w-2 rounded-full bg-stone-950" />
                  <div className="absolute right-3 bottom-0 h-4 w-2 rounded-full bg-stone-950" />
                  <div className="absolute -right-1 top-5 h-2 w-3 rounded-full bg-[#ffb703]" />
                </div>
              </div>

              {snapshot.obstacles.map((obstacle) => (
                <div
                  key={obstacle.id}
                  className="absolute bottom-[88px] rounded-t-[14px] border border-white/10 bg-[linear-gradient(180deg,#2b2d42_0%,#0f172a_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                  style={{
                    left: `${(obstacle.x / GAME_WIDTH) * 100}%`,
                    width: `${obstacle.width}px`,
                    height: `${obstacle.height}px`,
                  }}
                >
                  <div className="absolute inset-x-[20%] top-3 h-2 rounded-full bg-white/10" />
                </div>
              ))}

              <div className="absolute inset-x-0 bottom-0 h-[88px] bg-[linear-gradient(180deg,#46331f_0%,#22170f_100%)]">
                <div
                  className="h-full opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.12) 2px, transparent 2px, transparent 52px)",
                    backgroundSize: "54px 100%",
                    transform: `translateX(${-(roundedScore * 1.4) % 54}px)`,
                  }}
                />
              </div>

              {!snapshot.isRunning && !snapshot.isGameOver ? (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 px-6 text-center">
                  <div className="max-w-md rounded-[28px] border border-white/15 bg-black/35 p-8 text-white backdrop-blur">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-200">
                      Start
                    </p>
                    <h2 className="mt-3 text-3xl font-black">Press space to run</h2>
                    <p className="mt-3 text-sm leading-6 text-white/75">
                      The runner moves automatically. Jump just before each obstacle to keep going.
                    </p>
                  </div>
                </div>
              ) : null}

              {snapshot.isGameOver ? (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 px-6 text-center">
                  <div className="max-w-md rounded-[28px] border border-white/15 bg-black/55 p-8 text-white backdrop-blur">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-200">
                      Game Over
                    </p>
                    <h2 className="mt-3 text-3xl font-black">Score {roundedScore}</h2>
                    <p className="mt-3 text-sm leading-6 text-white/75">
                      Press R or use the button below to restart.
                    </p>
                    <button
                      type="button"
                      onClick={startGame}
                      className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-amber-300 px-5 text-sm font-black text-stone-950 transition hover:bg-amber-200"
                    >
                      Run Again
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[28px] border border-white/20 bg-white/12 p-5 text-white backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
              Control
            </p>
            <h2 className="mt-3 text-2xl font-black">One button timing</h2>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Use Space, Up, W, or tap/click the game area to jump.
            </p>
          </article>

          <article className="rounded-[28px] border border-white/20 bg-white/12 p-5 text-white backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
              Tempo
            </p>
            <h2 className="mt-3 text-2xl font-black">It keeps speeding up</h2>
            <p className="mt-3 text-sm leading-6 text-white/75">
              The longer you survive, the faster the pace and spawn timing become.
            </p>
          </article>

          <article className="rounded-[28px] border border-white/20 bg-white/12 p-5 text-white backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
              Record
            </p>
            <h2 className="mt-3 text-2xl font-black">Best score is saved</h2>
            <p className="mt-3 text-sm leading-6 text-white/75">
              High score is stored in your browser using localStorage.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
