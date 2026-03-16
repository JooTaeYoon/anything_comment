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
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-4xl items-center justify-center">
        <section className="w-full rounded-[32px] border border-stone-200/80 bg-white/90 p-8 shadow-[0_28px_90px_rgba(41,37,36,0.12)] backdrop-blur sm:p-12">
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
                Welcome
              </p>
              <p className="text-sm text-stone-500">
                방문자 수 {visitCount === null ? "불러오는 중..." : `${visitCount}명`}
              </p>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-stone-950 sm:text-5xl">
                안녕하세요.
              </h1>
              <p className="max-w-2xl whitespace-pre-line text-base leading-8 text-stone-600 sm:text-lg">
                여러분들의 고민 및 불평 불만 작성 해주세요. 해당 게시판은
                익명이고, 작성자가 작성한 내용 외 어떠한 정보도 저장 하지
                않습니다.
              </p>
            </div>
            <Link
              href="/board"
              className="inline-flex items-center gap-3 rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              작성 하러 가기
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
