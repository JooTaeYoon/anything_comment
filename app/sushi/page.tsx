"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Recipe = {
  id: string;
  title: string;
  speech: string;
  ingredients: string[];
};

type Ingredient = {
  id: string;
  label: string;
  tone: string;
  short: string;
};

const TEXT = {
  title: "\uCD08\uBC25 \uC8FC\uC138\uC694",
  intro:
    "\uC190\uB2D8\uC774 \uC8FC\uBB38\uD558\uBA74 \uC7AC\uB8CC\uB97C \uB20C\uB7EC \uCD08\uBC25\uC744 \uB9CC\uB4E4\uACE0, \uC644\uC131\uB41C \uC811\uC2DC\uB97C \uC190\uB2D8\uC5D0\uAC8C \uAC74\uB124\uB294 \uC7A5\uBA74\uD615 \uD504\uB85C\uD1A0\uD0C0\uC785\uC785\uB2C8\uB2E4.",
  startHint: "\uC2DC\uC791\uD558\uBA74 \uC190\uB2D8\uC774 \uC8FC\uBB38\uD569\uB2C8\uB2E4.",
  startFeedback:
    "\uC190\uB2D8\uC774 \uB4E4\uC5B4\uC654\uC5B4\uC694. \uC8FC\uBB38\uC744 \uD655\uC778\uD558\uC138\uC694.",
  closing: "\uAC00\uAC8C \uB9C8\uAC10. \uC624\uB298 \uC601\uC5C5\uC740 \uC5EC\uAE30\uAE4C\uC9C0\uC608\uC694.",
  ingredientPicked:
    "\uC88B\uC544\uC694. \uC7AC\uB8CC\uB97C \uB354 \uACE0\uB974\uAC70\uB098 \uC190\uB2D8\uC5D0\uAC8C \uC8FC\uC138\uC694.",
  cleared: "\uC811\uC2DC\uB97C \uBE44\uC6E0\uC5B4\uC694. \uB2E4\uC2DC \uB9CC\uB4E4\uC5B4\uBCF4\uC138\uC694.",
  wrongDish:
    "\uC190\uB2D8\uC774 \uACE0\uAC1C\uB97C \uAC38\uC6C3\uD588\uC5B4\uC694. \uC8FC\uBB38\uACFC \uB2E4\uB985\uB2C8\uB2E4.",
  nextGuest: "\uC0C8 \uC190\uB2D8\uC774 \uC549\uC558\uC2B5\uB2C8\uB2E4.",
  handLabel: "\uB0B4 \uC190",
  handEmpty: "\uC544\uC9C1 \uC548 \uC9D1\uC74C",
  handHolding: "\uC9D1\uACE0 \uC788\uB294 \uC7AC\uB8CC",
  plateEmpty: "\uC7AC\uB8CC\uB97C \uB20C\uB7EC \uC811\uC2DC\uB97C \uB9CC\uB4E4\uC5B4\uBCF4\uC138\uC694.",
  play1: "1. \uC190\uB2D8 \uB9D0\uD48D\uC120\uC5D0\uC11C \uC8FC\uBB38\uC744 \uBCF8\uB2E4.",
  play2: "2. \uC0DD\uC120 \uD558\uB098\uC640 \uBC25 \uD558\uB098\uB97C \uB204\uB978\uB2E4.",
  play3: "3. \uC190\uB2D8\uC5D0\uAC8C \uC8FC\uAE30 \uBC84\uD2BC\uC744 \uB204\uB978\uB2E4.",
  finalText:
    "\uC7A5\uBA74 \uC5F0\uCD9C \uD655\uC778\uC6A9 \uD504\uB85C\uD1A0\uD0C0\uC785\uC785\uB2C8\uB2E4. \uB2E4\uC74C \uB2E8\uACC4\uC5D0\uC11C\uB294 \uC190\uB2D8 \uC560\uB2C8\uBA54\uC774\uC158\uACFC \uC2E4\uC81C \uC190 \uC774\uB3D9 \uC5F0\uCD9C\uC744 \uBD99\uC774\uAE30 \uC88B\uC2B5\uB2C8\uB2E4.",
  score: "\uC810\uC218",
  mistakes: "\uC2E4\uC218",
  remainTime: "\uB0A8\uC740 \uC2DC\uAC04",
  guestOrder: "Guest Order",
  counterPlate: "Counter Plate",
  ingredientSelect: "\uC7AC\uB8CC \uC120\uD0DD",
  ingredientTitle: "\uC0DD\uC120\uACFC \uBC25",
  mobileOk: "Mobile OK",
  giveToGuest: "\uC190\uB2D8\uC5D0\uAC8C \uC8FC\uAE30",
  rebuild: "\uB2E4\uC2DC \uB9CC\uB4E4\uAE30",
  gameOver: "\uC601\uC5C5 \uC885\uB8CC",
  finalScore: "\uCD5C\uC885 \uC810\uC218",
  startWork: "\uC601\uC5C5 \uC2DC\uC791",
  restartWork: "\uB2E4\uC2DC \uC601\uC5C5\uD558\uAE30",
  fishReady: "\uC624\uB298 \uC900\uBE44\uB41C \uC7AC\uB8CC",
  riceReady: "\uCD08\uBC25\uC6A9 \uBC25",
} as const;

const INGREDIENTS: Ingredient[] = [
  {
    id: "halibut",
    label: "\uAD11\uC5B4",
    tone: "from-slate-100 to-slate-300",
    short: "\uAD11\uC5B4",
  },
  {
    id: "shrimp",
    label: "\uC0C8\uC6B0",
    tone: "from-orange-100 to-orange-300",
    short: "\uC0C8\uC6B0",
  },
  {
    id: "salmon",
    label: "\uC5F0\uC5B4",
    tone: "from-rose-100 to-rose-300",
    short: "\uC5F0\uC5B4",
  },
  {
    id: "rice",
    label: "\uBC25",
    tone: "from-stone-50 to-stone-200",
    short: "\uBC25",
  },
];

const RECIPES: Recipe[] = [
  {
    id: "halibut-sushi",
    title: "\uAD11\uC5B4\uCD08\uBC25",
    speech: "\uAD11\uC5B4\uCD08\uBC25 \uC8FC\uC138\uC694.",
    ingredients: ["halibut", "rice"],
  },
  {
    id: "shrimp-sushi",
    title: "\uC0C8\uC6B0\uCD08\uBC25",
    speech: "\uC0C8\uC6B0\uCD08\uBC25 \uC8FC\uC138\uC694.",
    ingredients: ["shrimp", "rice"],
  },
  {
    id: "salmon-sushi",
    title: "\uC5F0\uC5B4\uCD08\uBC25",
    speech: "\uC5F0\uC5B4\uCD08\uBC25 \uC8FC\uC138\uC694.",
    ingredients: ["salmon", "rice"],
  },
];

const ORDER_TIME = 15;

const randomRecipe = () => RECIPES[Math.floor(Math.random() * RECIPES.length)];

function IngredientArt({
  ingredientId,
  size = "large",
}: {
  ingredientId: string;
  size?: "small" | "large";
}) {
  const isSmall = size === "small";
  const widthClass = isSmall ? "w-14 h-10" : "w-24 h-16";
  const riceClass = isSmall ? "w-11 h-5" : "w-18 h-7";

  if (ingredientId === "rice") {
    return (
      <div className={`relative ${widthClass}`}>
        <div className={`absolute inset-x-1 bottom-1 ${riceClass} rounded-full bg-white shadow-[inset_0_-4px_10px_rgba(0,0,0,0.08)]`} />
        <div className="absolute inset-x-2 bottom-2 h-2 rounded-full bg-stone-100 opacity-90" />
      </div>
    );
  }

  if (ingredientId === "salmon") {
    return (
      <div className={`relative ${widthClass}`}>
        <div className="absolute inset-x-1 top-1 bottom-1 rounded-[999px] bg-[#ff9f8f] shadow-[0_8px_18px_rgba(0,0,0,0.12)]" />
        <div className="absolute inset-x-3 top-2 h-1 rounded-full bg-[#ffd2cb]" />
        <div className="absolute inset-x-4 top-4 h-1 rounded-full bg-[#ffd2cb]" />
        <div className="absolute inset-x-3 top-6 h-1 rounded-full bg-[#ffd2cb]" />
      </div>
    );
  }

  if (ingredientId === "shrimp") {
    return (
      <svg
        viewBox="0 0 120 80"
        className={widthClass}
        aria-hidden="true"
      >
        <path
          d="M25 54c5-20 18-33 36-36 16-3 31 5 40 18-7 6-11 12-12 19-2 9-1 14 4 21-13 1-26-2-39-7-11-5-21-9-29-15Z"
          fill="#ff955c"
        />
        <path
          d="M34 50c5-13 14-22 27-25 12-3 23 2 31 11"
          fill="none"
          stroke="#ffd2b8"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M45 57c5-12 13-18 24-20 9-2 17 1 24 6"
          fill="none"
          stroke="#ffd2b8"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="92" cy="30" r="3.5" fill="#2b1108" />
        <path d="M100 24 113 17 106 31Z" fill="#ffb38f" />
        <path d="M102 41 114 38 106 51Z" fill="#ffb38f" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 120 80"
      className={widthClass}
      aria-hidden="true"
    >
      <path
        d="M12 41c13-15 29-25 48-28 17-2 31 2 44 12-8 5-13 11-14 17 1 8 6 14 14 19-13 9-27 13-44 11-19-3-35-12-48-31Z"
        fill="#cfd6de"
      />
      <path d="M92 31 110 20 106 37Z" fill="#b8c2cc" />
      <path d="M92 50 109 60 103 44Z" fill="#b8c2cc" />
      <path
        d="M27 43c16-11 31-18 49-20"
        fill="none"
        stroke="#eef2f7"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M28 53c15-8 28-12 42-14"
        fill="none"
        stroke="#eef2f7"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="82" cy="33" r="3" fill="#1f2937" />
      <path d="M16 40 7 30 6 49Z" fill="#d8dee6" />
    </svg>
  );
}

export default function SushiPage() {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>(RECIPES[0]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ORDER_TIME);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState<string>(TEXT.startHint);
  const [servedDish, setServedDish] = useState<string | null>(null);
  const nextOrderTimerRef = useRef<number | null>(null);

  const selectedLabels = useMemo(
    () =>
      selectedIngredients.map(
        (id) => INGREDIENTS.find((ingredient) => ingredient.id === id)?.short ?? "?",
      ),
    [selectedIngredients],
  );
  const selectedDetails = useMemo(
    () =>
      selectedIngredients
        .map((id) => INGREDIENTS.find((ingredient) => ingredient.id === id))
        .filter((ingredient): ingredient is Ingredient => Boolean(ingredient)),
    [selectedIngredients],
  );

  const resetOrder = (recipe?: Recipe) => {
    setCurrentRecipe(recipe ?? randomRecipe());
    setSelectedIngredients([]);
    setServedDish(null);
    setTimeLeft(ORDER_TIME);
  };

  useEffect(() => {
    return () => {
      if (nextOrderTimerRef.current !== null) {
        window.clearTimeout(nextOrderTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setIsPlaying(false);
          setIsGameOver(true);
          setFeedback(TEXT.closing);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [isPlaying, timeLeft]);

  const startGame = () => {
    if (nextOrderTimerRef.current !== null) {
      window.clearTimeout(nextOrderTimerRef.current);
    }

    setScore(0);
    setMistakes(0);
    setIsGameOver(false);
    setIsPlaying(true);
    setFeedback(TEXT.startFeedback);
    resetOrder(randomRecipe());
  };

  const handleIngredientClick = (ingredientId: string) => {
    if (!isPlaying || selectedIngredients.length >= 2) {
      return;
    }

    setSelectedIngredients((current) => [...current, ingredientId]);
    setServedDish(null);
    setFeedback(TEXT.ingredientPicked);
  };

  const clearPlate = () => {
    if (!isPlaying) {
      return;
    }

    setSelectedIngredients([]);
    setServedDish(null);
    setFeedback(TEXT.cleared);
  };

  const giveToGuest = () => {
    if (!isPlaying) {
      return;
    }

    const isCorrect =
      selectedIngredients.length === currentRecipe.ingredients.length &&
      selectedIngredients.every((ingredient, index) => ingredient === currentRecipe.ingredients[index]);

    if (!isCorrect) {
      setMistakes((current) => current + 1);
      setSelectedIngredients([]);
      setTimeLeft((current) => Math.max(4, current - 2));
      setFeedback(TEXT.wrongDish);
      return;
    }

    setScore((current) => current + 10);
    setServedDish(currentRecipe.title);
    setFeedback(`${currentRecipe.title} \uC804\uB2EC \uC644\uB8CC. \uB2E4\uC74C \uC190\uB2D8\uC774 \uC635\uB2C8\uB2E4.`);

    nextOrderTimerRef.current = window.setTimeout(() => {
      setFeedback(TEXT.nextGuest);
      resetOrder(randomRecipe());
    }, 700);
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#ffe8d8_42%,#f4c8a0_100%)] px-3 py-4 text-stone-950 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-6">
        <section className="rounded-[30px] border border-white/60 bg-white/75 p-5 shadow-[0_24px_80px_rgba(120,53,15,0.12)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-700">
                Sushi Scene Prototype
              </p>
              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{TEXT.title}</h1>
                <p className="max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                  {TEXT.intro}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-full border border-stone-300 px-5 text-sm font-semibold text-stone-700 transition hover:border-stone-900 hover:text-stone-950"
              >
                Home
              </Link>
              <button
                type="button"
                onClick={startGame}
                className="inline-flex h-11 items-center justify-center rounded-full bg-stone-950 px-5 text-sm font-black text-white transition hover:bg-stone-800"
              >
                {isPlaying ? TEXT.restartWork : TEXT.startWork}
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-white/55 bg-[#fffaf5] p-3 shadow-[0_18px_60px_rgba(120,53,15,0.12)] sm:p-5">
            <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#fff5ea_0%,#ffe0bf_100%)] p-4 sm:p-6">
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,#fffdf8_0%,transparent_68%)]" />

              <div className="relative flex flex-wrap gap-2 text-xs font-semibold sm:text-sm">
                <div className="rounded-full bg-white/75 px-3 py-2">
                  {TEXT.score} {score}
                </div>
                <div className="rounded-full bg-white/75 px-3 py-2">
                  {TEXT.mistakes} {mistakes}
                </div>
                <div className="rounded-full bg-stone-950 px-3 py-2 text-white">
                  {TEXT.remainTime} {timeLeft}s
                </div>
              </div>

              <div className="relative mt-5 rounded-[26px] bg-[linear-gradient(180deg,#fffdfb_0%,#fff2e2_100%)] px-4 pb-8 pt-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="relative h-32 w-28 sm:h-40 sm:w-36">
                      <div className="absolute inset-x-5 top-3 h-8 rounded-full bg-stone-950" />
                      <div className="absolute left-7 top-9 h-20 w-16 rounded-[999px] bg-[#ffe2c1] sm:left-10 sm:h-24 sm:w-20" />
                      <div className="absolute left-9 top-16 h-2 w-2 rounded-full bg-stone-950 sm:left-14" />
                      <div className="absolute right-9 top-16 h-2 w-2 rounded-full bg-stone-950 sm:right-14" />
                      <div className="absolute left-1/2 top-20 h-2 w-8 -translate-x-1/2 rounded-full border-b-2 border-stone-950" />
                      <div className="absolute bottom-0 left-1/2 h-14 w-24 -translate-x-1/2 rounded-t-[26px] bg-[#7dd3fc] sm:h-16 sm:w-28" />
                    </div>
                    <div className="max-w-[15rem] rounded-[22px] bg-white px-4 py-3 text-sm font-semibold leading-6 text-stone-700 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                      &quot;{currentRecipe.speech}&quot;
                    </div>
                  </div>

                  <div className="flex min-h-40 flex-1 items-end justify-end">
                    <div className="relative h-28 w-44 sm:h-36 sm:w-56">
                      <div className="absolute bottom-2 left-2 rounded-[20px] border border-stone-200 bg-white px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                          {TEXT.handLabel}
                        </p>
                        <div className="mt-3 flex items-end gap-3">
                          <div className="relative h-16 w-20 sm:h-20 sm:w-24">
                            {selectedDetails.length > 0 ? (
                              <div className="absolute -left-1 -top-3 z-20 flex flex-col gap-1">
                                {selectedDetails.map((ingredient, index) => (
                                  <div
                                    key={`hand-${ingredient.id}-${index}`}
                                    className="rounded-2xl bg-white/90 px-2 py-1 shadow-[0_10px_16px_rgba(0,0,0,0.14)]"
                                  >
                                    <IngredientArt ingredientId={ingredient.id} size="small" />
                                  </div>
                                ))}
                              </div>
                            ) : null}
                            <div className="absolute bottom-0 right-0 h-10 w-16 rounded-[20px] bg-[#ffe0c2] shadow-[0_14px_24px_rgba(120,53,15,0.15)] sm:h-12 sm:w-20" />
                            <div className="absolute bottom-6 right-10 h-7 w-4 rounded-full bg-[#ffd3ad] sm:bottom-7 sm:right-12" />
                            <div className="absolute bottom-7 right-6 h-8 w-4 rounded-full bg-[#ffd3ad] sm:bottom-8 sm:right-8" />
                            <div className="absolute bottom-8 right-2 h-7 w-4 rounded-full bg-[#ffd3ad] sm:bottom-9" />
                            <div className="absolute bottom-3 left-1 h-4 w-12 rounded-full bg-black/10 blur-md" />
                          </div>
                          <div className="min-w-24">
                            <p className="text-[11px] font-semibold text-stone-400">
                              {selectedDetails.length > 0 ? TEXT.handHolding : TEXT.handEmpty}
                            </p>
                            <p className="mt-1 text-sm font-bold text-stone-700">
                              {selectedLabels.length > 0 ? selectedLabels.join(" + ") : "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-dashed border-stone-300 pt-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
                        {TEXT.counterPlate}
                      </p>
                      <div className="mt-3 min-h-28 rounded-[24px] bg-white px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                        {selectedDetails.length > 0 ? (
                          <div className="flex min-h-20 items-center justify-center">
                            <div className="relative h-24 w-52">
                              <div className="absolute bottom-1 left-1/2 h-16 w-44 -translate-x-1/2 rounded-full border border-stone-200 bg-[radial-gradient(circle_at_top,#ffffff_0%,#f4f4f5_100%)] shadow-[0_10px_24px_rgba(0,0,0,0.08)]" />
                              {selectedDetails.map((ingredient, index) => (
                                <div
                                  key={`${ingredient.id}-${index}`}
                                  className="absolute flex items-center justify-center rounded-2xl bg-transparent shadow-none"
                                  style={{
                                    bottom: index === 0 ? "2.1rem" : "3rem",
                                    left: index === 0 ? "1.6rem" : undefined,
                                    right: index === 0 ? undefined : "1.6rem",
                                  }}
                                >
                                  <IngredientArt ingredientId={ingredient.id} />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex min-h-20 items-center justify-center">
                            <p className="text-sm text-stone-400">{TEXT.plateEmpty}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2 sm:w-44">
                      <button
                        type="button"
                        onClick={giveToGuest}
                        className="inline-flex h-14 items-center justify-center rounded-[20px] bg-[#ff7f50] px-5 text-base font-black text-white transition active:scale-[0.98]"
                      >
                        {TEXT.giveToGuest}
                      </button>
                      <button
                        type="button"
                        onClick={clearPlate}
                        className="inline-flex h-12 items-center justify-center rounded-[18px] border border-stone-200 bg-white px-5 text-sm font-semibold text-stone-700 transition active:scale-[0.99]"
                      >
                        {TEXT.rebuild}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[22px] bg-stone-950 px-4 py-3 text-sm leading-6 text-white/85">
                  {feedback}
                  {servedDish ? ` ${servedDish} \uC131\uACF5.` : ""}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/55 bg-white/85 p-4 shadow-[0_18px_60px_rgba(120,53,15,0.12)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
                  {TEXT.ingredientSelect}
                </p>
                <h2 className="mt-2 text-2xl font-black text-stone-950">{TEXT.ingredientTitle}</h2>
              </div>
              <div className="rounded-full bg-orange-100 px-3 py-2 text-xs font-semibold text-orange-900">
                {TEXT.mobileOk}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {INGREDIENTS.map((ingredient) => (
                <button
                  key={ingredient.id}
                  type="button"
                  onClick={() => handleIngredientClick(ingredient.id)}
                  className={`flex min-h-32 flex-col items-center justify-center rounded-[24px] border border-stone-200 bg-gradient-to-b ${ingredient.tone} px-3 py-4 text-center transition active:scale-[0.98] sm:min-h-36`}
                >
                  <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-black text-stone-800">
                    {ingredient.label}
                  </span>
                  <span className="mt-3 text-xs text-stone-600">
                    {ingredient.id === "rice" ? TEXT.riceReady : TEXT.fishReady}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-[24px] border border-stone-200 bg-stone-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                How To Play
              </p>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
                <li>{TEXT.play1}</li>
                <li>{TEXT.play2}</li>
                <li>{TEXT.play3}</li>
              </ol>
            </div>

            {isGameOver ? (
              <div className="mt-4 rounded-[24px] border border-rose-200 bg-rose-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">
                  {TEXT.gameOver}
                </p>
                <h3 className="mt-2 text-2xl font-black text-stone-950">
                  {TEXT.finalScore} {score}
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{TEXT.finalText}</p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
