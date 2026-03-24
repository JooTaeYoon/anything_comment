"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const VISIT_STORAGE_KEY = "home-visit-counted";

type VisitResponse = {
  count?: number;
};

export default function Home() {
  const [visitCount, setVisitCount] = useState<number | null>(null);

  useEffect(() => {
    const syncVisitCount = async () => {
      try {
        const hasCountedVisit =
          window.sessionStorage.getItem(VISIT_STORAGE_KEY) === "true";
        const response = await fetch("/api/visits", {
          method: hasCountedVisit ? "GET" : "POST",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to sync visit count");
        }

        const data = (await response.json()) as VisitResponse;
        setVisitCount(data.count ?? 0);

        if (!hasCountedVisit) {
          window.sessionStorage.setItem(VISIT_STORAGE_KEY, "true");
        }
      } catch (error) {
        console.error(error);
      }
    };

    void syncVisitCount();
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(29,42,106,0.12),transparent_32%),linear-gradient(180deg,#f7f9fc_0%,#eef3fb_52%,#f8fafc_100%)] px-6 py-10 text-[var(--foreground)]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <section className="relative w-full overflow-hidden rounded-[var(--radius-xl)] border bg-[var(--surface)] p-8 shadow-[var(--shadow-soft)] sm:p-12">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#1d2a6a_0%,#455a64_65%,#ff6d00_100%)]" />

          <div className="relative space-y-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
                Anything Playground
              </p>
              <p className="rounded-full border bg-[var(--surface-muted)] px-4 py-2 text-sm text-[var(--secondary)]">
                Visits {visitCount === null ? "Loading..." : `${visitCount}`}
              </p>
            </div>

            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)] lg:items-end">
              <div className="space-y-5">
                <div className="inline-flex rounded-full border bg-[rgba(255,109,0,0.08)] px-4 py-2 text-sm font-medium text-[var(--tertiary)]">
                  Light theme / Public Sans / Moderate radius
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-[var(--foreground)] sm:text-5xl lg:text-6xl">
                    Build, test, and explore in a calmer blue-forward workspace.
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-[var(--secondary)] sm:text-lg">
                    Leave your concerns, complaints, or anything on your mind.
                    The board is anonymous, and the rest of the playground is
                    organized as quick interactive demos you can jump into.
                  </p>
                </div>
              </div>

              <div className="rounded-[var(--radius-lg)] border bg-[linear-gradient(160deg,#1d2a6a_0%,#24357f_58%,#455a64_100%)] p-6 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">
                  Theme Snapshot
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-[var(--radius-md)] bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-blue-100/80">
                      Primary
                    </p>
                    <p className="mt-2 text-lg font-semibold">#1d2a6a</p>
                  </div>
                  <div className="rounded-[var(--radius-md)] bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-blue-100/80">
                      Secondary
                    </p>
                    <p className="mt-2 text-lg font-semibold">#455A64</p>
                  </div>
                  <div className="rounded-[var(--radius-md)] bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-blue-100/80">
                      Accent
                    </p>
                    <p className="mt-2 text-lg font-semibold">#FF6D00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[rgba(69,90,100,0.2)]" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
                Explore
              </p>
              <div className="h-px flex-1 bg-[rgba(69,90,100,0.2)]" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Link
                href="/board"
                className="group rounded-[var(--radius-lg)] border bg-[var(--primary)] px-6 py-6 text-white transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(29,42,106,0.22)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">
                  Board
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  Open board
                </h2>
                <p className="mt-3 text-sm leading-6 text-blue-100/88">
                  Write anonymous posts and browse the latest entries.
                </p>
              </Link>

              <Link
                href="/sushi"
                className="group rounded-[var(--radius-lg)] border bg-[var(--surface-muted)] px-6 py-6 text-[var(--foreground)] transition duration-200 hover:-translate-y-1 hover:border-[rgba(255,109,0,0.28)] hover:shadow-[0_18px_44px_rgba(255,109,0,0.14)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--tertiary)]">
                  Food Game
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  Play Sushi Tap
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--secondary)]">
                  Take guest orders and build sushi with large mobile-friendly
                  controls.
                </p>
              </Link>

              <Link
                href="/exit8"
                className="group rounded-[var(--radius-lg)] border bg-white px-6 py-6 text-[var(--foreground)] transition duration-200 hover:-translate-y-1 hover:border-[rgba(29,42,106,0.24)] hover:shadow-[0_18px_44px_rgba(69,90,100,0.12)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--secondary)]">
                  3D Prototype
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  Play Exit 8
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--secondary)]">
                  Walk a looping corridor and decide whether an anomaly is
                  present.
                </p>
              </Link>

              <Link
                href="/phaser"
                className="group rounded-[var(--radius-lg)] border bg-[linear-gradient(180deg,#ffffff_0%,#eef2f7_100%)] px-6 py-6 text-[var(--foreground)] transition duration-200 hover:-translate-y-1 hover:border-[rgba(29,42,106,0.24)] hover:shadow-[0_18px_44px_rgba(29,42,106,0.12)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                  2D Game
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  Play Phaser Demo
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--secondary)]">
                  Try a small arcade prototype built with Phaser.
                </p>
              </Link>
            </div>

            <div className="grid gap-4 rounded-[var(--radius-lg)] border bg-[var(--surface-muted)] p-5 sm:grid-cols-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                  Typography
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--secondary)]">
                  Public Sans is used for headlines, body text, and labels.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                  Roundedness
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--secondary)]">
                  Components use a moderate radius for a clean, friendly feel.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                  Spacing
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--secondary)]">
                  Normal spacing keeps the layout open without feeling loose.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
