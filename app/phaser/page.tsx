"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function createNeonDodgeScene(
  Phaser: typeof import("phaser"),
  controls: {
    leftPressedRef: React.MutableRefObject<boolean>;
    rightPressedRef: React.MutableRefObject<boolean>;
  },
  callbacks: {
    setScore: React.Dispatch<React.SetStateAction<number>>;
    setLives: React.Dispatch<React.SetStateAction<number>>;
    setStatus: React.Dispatch<React.SetStateAction<string>>;
  },
) {
  return class NeonDodgeScene extends Phaser.Scene {
    private player!: import("phaser").Physics.Arcade.Image;
    private cursors?: import("phaser").Types.Input.Keyboard.CursorKeys;
    private hazards!: import("phaser").Physics.Arcade.Group;
    private orbs!: import("phaser").Physics.Arcade.Group;
    private spawnTimer = 0;
    private orbTimer = 0;
    private scoreValue = 0;
    private livesValue = 3;
    private ended = false;

    constructor() {
      super("neon-dodge");
    }

    preload() {
      const graphics = this.add.graphics();
      this.load.image("playerSprite", "/img/my-character.png");

      graphics.fillStyle(0x62f3ff, 1);
      graphics.fillCircle(16, 16, 16);
      graphics.generateTexture("orb", 32, 32);
      graphics.clear();

      graphics.fillStyle(0xff6767, 1);
      graphics.fillRoundedRect(0, 0, 28, 28, 8);
      graphics.generateTexture("hazard", 28, 28);
      graphics.clear();

      graphics.fillStyle(0x121826, 1);
      graphics.fillRect(0, 0, 8, 64);
      graphics.generateTexture("lane", 8, 64);
      graphics.destroy();
    }

    create() {
      this.cameras.main.setBackgroundColor("#090c14");

      const sourceImage = this.textures.get("playerSprite").getSourceImage() as CanvasImageSource & {
        width: number;
        height: number;
      };
      const processedTexture = this.textures.createCanvas(
        "playerSpriteCutout",
        sourceImage.width,
        sourceImage.height,
      );
      if (!processedTexture) {
        throw new Error("Failed to create processed Phaser texture.");
      }
      const processedContext = processedTexture.getContext();
      processedContext.drawImage(sourceImage, 0, 0);
      const imageData = processedContext.getImageData(
        0,
        0,
        sourceImage.width,
        sourceImage.height,
      );
      const pixels = imageData.data;

      for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];

        if (red > 245 && green > 245 && blue > 245) {
          pixels[index + 3] = 0;
        }
      }

      processedContext.putImageData(imageData, 0, 0);
      processedTexture.refresh();

      for (let i = 0; i < 7; i += 1) {
        const lane = this.add.image(60 + i * 60, 300, "lane");
        lane.setAlpha(i % 2 === 0 ? 0.24 : 0.12);
      }

      this.add.rectangle(240, 28, 420, 36, 0x0f1726, 0.7).setStrokeStyle(1, 0x2dd4ff, 0.2);
      this.add.text(28, 17, "NEON DODGE", {
        color: "#cbfbff",
        fontFamily: "Segoe UI, sans-serif",
        fontSize: "18px",
        fontStyle: "700",
      });

      this.player = this.physics.add.image(240, 560, "playerSpriteCutout");
      this.player.setDisplaySize(72, 72);
      this.player.setCollideWorldBounds(true);
      this.player.setDragX(1600);
      this.player.setMaxVelocity(360, 0);
      this.player.setDepth(10);

      this.hazards = this.physics.add.group();
      this.orbs = this.physics.add.group();
      this.cursors = this.input.keyboard?.createCursorKeys();

      this.physics.add.overlap(this.player, this.orbs, (_, orb) => {
        orb.destroy();
        this.scoreValue += 10;
        callbacks.setScore(this.scoreValue);
        callbacks.setStatus("Good catch. Stay alive.");
      });

      this.physics.add.overlap(this.player, this.hazards, (_, hazard) => {
        hazard.destroy();
        this.livesValue -= 1;
        callbacks.setLives(this.livesValue);

        if (this.livesValue <= 0) {
          this.ended = true;
          this.physics.pause();
          callbacks.setStatus("Game over. Reload the page to restart.");
          return;
        }

        callbacks.setStatus("Hit. Watch the next wave.");
        this.player.setTint(0xffb4b4);
        this.time.delayedCall(140, () => this.player.clearTint());
      });

      this.input.on("pointermove", (pointer: import("phaser").Input.Pointer) => {
        if (!pointer.isDown || this.ended) {
          return;
        }

        this.player.x = Phaser.Math.Clamp(pointer.x, 24, 456);
      });
    }

    private spawnHazard() {
      const hazard = this.hazards.create(
        Phaser.Math.Between(36, 444),
        -20,
        "hazard",
      ) as import("phaser").Physics.Arcade.Image;

      hazard.setVelocityY(Phaser.Math.Between(240, 340));
      hazard.setAngularVelocity(Phaser.Math.Between(-160, 160));
    }

    private spawnOrb() {
      const orb = this.orbs.create(
        Phaser.Math.Between(36, 444),
        -20,
        "orb",
      ) as import("phaser").Physics.Arcade.Image;

      orb.setVelocityY(220);
    }

    update(_: number, delta: number) {
      if (this.ended) {
        return;
      }

      const leftActive = this.cursors?.left?.isDown || controls.leftPressedRef.current;
      const rightActive = this.cursors?.right?.isDown || controls.rightPressedRef.current;

      if (leftActive) {
        this.player.setVelocityX(-300);
      } else if (rightActive) {
        this.player.setVelocityX(300);
      }

      this.spawnTimer += delta;
      this.orbTimer += delta;

      if (this.spawnTimer > 520) {
        this.spawnTimer = 0;
        this.spawnHazard();
      }

      if (this.orbTimer > 1100) {
        this.orbTimer = 0;
        this.spawnOrb();
      }

      this.hazards.children.each((child) => {
        const sprite = child as import("phaser").Physics.Arcade.Image;
        if (sprite.y > 690) {
          sprite.destroy();
        }

        return true;
      });

      this.orbs.children.each((child) => {
        const sprite = child as import("phaser").Physics.Arcade.Image;
        if (sprite.y > 690) {
          sprite.destroy();
        }

        return true;
      });
    }
  };
}

export default function PhaserPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<import("phaser").Game | null>(null);
  const leftPressedRef = useRef(false);
  const rightPressedRef = useRef(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [status, setStatus] = useState("Collect cyan orbs and dodge red blocks.");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const Phaser = await import("phaser");

      if (cancelled || !containerRef.current) {
        return;
      }
      const NeonDodgeScene = createNeonDodgeScene(
        Phaser,
        {
          leftPressedRef,
          rightPressedRef,
        },
        {
          setScore,
          setLives,
          setStatus,
        },
      );

      const config: import("phaser").Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 480,
        height: 640,
        parent: containerRef.current,
        transparent: true,
        physics: {
          default: "arcade",
          arcade: {
            debug: false,
          },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: NeonDodgeScene,
      };

      gameRef.current = new Phaser.Game(config);
    };

    void run();

    return () => {
      cancelled = true;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#0f1e35_0%,#080b14_55%,#030406_100%)] px-3 py-3 pb-32 text-white sm:px-6 sm:py-8 sm:pb-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:gap-6">
        <section className="rounded-[26px] border border-cyan-200/10 bg-white/6 p-4 shadow-[0_28px_100px_rgba(0,0,0,0.35)] backdrop-blur sm:rounded-[30px] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-200">
                Phaser Demo
              </p>
              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Neon Dodge</h1>
                <p className="max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
                  A small Phaser arcade prototype with physics, spawning hazards, collectibles, and touch controls.
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
              <Link
                href="/phaser"
                className="inline-flex h-11 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-black text-stone-950 transition hover:bg-cyan-200"
              >
                Reload Demo
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 xl:grid-cols-[1fr_0.8fr] sm:gap-4">
          <div className="rounded-[26px] border border-cyan-200/10 bg-white/6 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur sm:rounded-[30px] sm:p-5">
            <div className="overflow-hidden rounded-[26px] border border-cyan-200/10 bg-[linear-gradient(180deg,#040812_0%,#07111e_100%)]">
              <div
                ref={containerRef}
                className="mx-auto h-[min(52dvh,520px)] w-full max-w-[390px] touch-none sm:h-[640px] sm:max-w-[480px]"
              />
            </div>

            <div className="mt-3 rounded-[22px] border border-cyan-200/10 bg-white/6 p-3 sm:hidden">
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <div className="rounded-full bg-white/8 px-3 py-2">Score {score}</div>
                <div className="rounded-full bg-white/8 px-3 py-2">Lives {lives}</div>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/72">{status}</p>
            </div>

            <div className="mt-4 hidden grid-cols-2 gap-3 sm:grid">
              <button
                type="button"
                onPointerDown={() => {
                  leftPressedRef.current = true;
                }}
                onPointerUp={() => {
                  leftPressedRef.current = false;
                }}
                onPointerLeave={() => {
                  leftPressedRef.current = false;
                }}
                className="inline-flex h-16 items-center justify-center rounded-[22px] border border-white/15 bg-white/8 text-base font-black text-white transition active:scale-[0.98]"
              >
                LEFT
              </button>
              <button
                type="button"
                onPointerDown={() => {
                  rightPressedRef.current = true;
                }}
                onPointerUp={() => {
                  rightPressedRef.current = false;
                }}
                onPointerLeave={() => {
                  rightPressedRef.current = false;
                }}
                className="inline-flex h-16 items-center justify-center rounded-[22px] bg-cyan-300 text-base font-black text-stone-950 transition active:scale-[0.98]"
              >
                RIGHT
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <section className="hidden rounded-[30px] border border-cyan-200/10 bg-white/6 p-5 backdrop-blur sm:block">
              <div className="flex flex-wrap gap-2 text-sm font-semibold">
                <div className="rounded-full bg-white/8 px-4 py-2">Score {score}</div>
                <div className="rounded-full bg-white/8 px-4 py-2">Lives {lives}</div>
                <div className="rounded-full bg-white/8 px-4 py-2">Tool Phaser</div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/72">{status}</p>
            </section>

            <section className="hidden rounded-[30px] border border-cyan-200/10 bg-white/6 p-5 backdrop-blur xl:block">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                About Phaser
              </p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-white/72">
                <p>Phaser is still one of the most practical tools for 2D browser games.</p>
                <p>It is not just a trend tool. It is mature, popular, and still very usable in 2026.</p>
                <p>For 2D web games, it is a much more natural fit than building everything with plain CSS.</p>
              </div>
            </section>

            <section className="hidden rounded-[30px] border border-cyan-200/10 bg-white/6 p-5 backdrop-blur xl:block">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Controls
              </p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-white/72">
                <p>Desktop: Arrow keys.</p>
                <p>Mobile: Hold left and right buttons.</p>
                <p>Goal: Collect cyan orbs and dodge red blocks.</p>
              </div>
            </section>
          </div>
        </section>

        <section className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-200/10 bg-[#060c16dd] p-3 backdrop-blur sm:hidden">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3">
            <button
              type="button"
              onPointerDown={() => {
                leftPressedRef.current = true;
              }}
              onPointerUp={() => {
                leftPressedRef.current = false;
              }}
              onPointerLeave={() => {
                leftPressedRef.current = false;
              }}
              className="inline-flex h-16 items-center justify-center rounded-[22px] border border-white/15 bg-white/8 text-base font-black text-white transition active:scale-[0.98]"
            >
              LEFT
            </button>
            <button
              type="button"
              onPointerDown={() => {
                rightPressedRef.current = true;
              }}
              onPointerUp={() => {
                rightPressedRef.current = false;
              }}
              onPointerLeave={() => {
                rightPressedRef.current = false;
              }}
              className="inline-flex h-16 items-center justify-center rounded-[22px] bg-cyan-300 text-base font-black text-stone-950 transition active:scale-[0.98]"
            >
              RIGHT
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
