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
        const hasCountedVisit = window.sessionStorage.getItem(VISIT_STORAGE_KEY) === "true";
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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8efe6_0%,#fffaf4_50%,#f3ebe2_100%)] px-6 py-12 text-stone-900">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-5xl items-center justify-center">
        <section className="w-full rounded-[32px] border border-stone-200/80 bg-white/90 p-8 shadow-[0_28px_90px_rgba(41,37,36,0.12)] backdrop-blur sm:p-12">
          <div className="space-y-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
                Welcome
              </p>
              <p className="text-sm text-stone-500">
                Visits {visitCount === null ? "Loading..." : `${visitCount}`}
              </p>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-stone-950 sm:text-5xl">
                Hello.
              </h1>
              <p className="max-w-2xl whitespace-pre-line text-base leading-8 text-stone-600 sm:text-lg">
                Leave your concerns, complaints, or anything on your mind. The board is anonymous
                and does not store information beyond the text you submit.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Link
                href="/board"
                className="group rounded-[28px] border border-stone-200 bg-stone-950 px-6 py-6 text-white transition hover:bg-stone-900"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">
                  Board
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">Open board</h2>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                  Write anonymous posts and browse the latest entries.
                </p>
              </Link>

              <Link
                href="/nom"
                className="group rounded-[28px] border border-amber-200 bg-[linear-gradient(135deg,#fff7d6_0%,#ffd17c_50%,#ff9f57_100%)] px-6 py-6 text-stone-950 transition hover:shadow-[0_20px_60px_rgba(245,158,11,0.28)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-900">
                  Flash Game
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">Play NOM</h2>
                <p className="mt-3 text-sm leading-6 text-stone-700">
                  Jump through an old-school browser runner inspired by the classic flash game.
                </p>
              </Link>

              <Link
                href="/sushi"
                className="group rounded-[28px] border border-orange-200 bg-[linear-gradient(135deg,#fff7f0_0%,#ffd7ba_45%,#ffb48a_100%)] px-6 py-6 text-stone-950 transition hover:shadow-[0_20px_60px_rgba(249,115,22,0.2)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-900">
                  Food Game
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">Play Sushi Tap</h2>
                <p className="mt-3 text-sm leading-6 text-stone-700">
                  Take guest orders and build sushi by tapping large mobile-friendly ingredients.
                </p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
