"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Post = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

const POSTS_PER_PAGE = 4;
const CATEGORY_TABS = ["Free Talk", "Jobs", "Maintenance", "Q&A", "Routes"];

function formatRelativeTime(value: string) {
  const timestamp = new Date(value);
  const diff = Date.now() - timestamp.getTime();

  if (Number.isNaN(timestamp.getTime())) {
    return "Recently";
  }

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return timestamp.toLocaleDateString("ko-KR");
}

function getPostAccent(index: number) {
  const accents = [
    "border-[rgba(255,109,0,0.38)] bg-[linear-gradient(135deg,rgba(255,109,0,0.12),rgba(29,42,106,0.04))]",
    "border-[rgba(29,42,106,0.22)] bg-[rgba(255,255,255,0.04)]",
    "border-[rgba(69,90,100,0.3)] bg-[rgba(255,255,255,0.02)]",
  ];

  return accents[index % accents.length];
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/posts", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load boards");
        }

        const data = (await response.json()) as Post[];
        setPosts(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("게시글을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return posts;
    }

    return posts.filter((post) =>
      `${post.title} ${post.content}`.toLowerCase().includes(normalizedQuery),
    );
  }, [posts, query]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPosts.length / POSTS_PER_PAGE),
  );
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextTitle = title.trim();
    const nextContent = content.trim();

    if (!nextTitle || !nextContent) {
      setErrorMessage("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: nextTitle,
          content: nextContent,
        }),
      });

      const data = (await response.json()) as Post | { message?: string };

      if (!response.ok || !("id" in data)) {
        throw new Error(
          "message" in data
            ? (data.message ?? "Failed to create board")
            : "Failed to create board",
        );
      }

      setPosts((currentPosts) => [data, ...currentPosts]);
      setCurrentPage(1);
      setTitle("");
      setContent("");
      setQuery("");
      setIsComposerOpen(false);
    } catch (error) {
      console.error(error);
      setErrorMessage("게시글을 저장하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#0f111a_0%,#171b2b_100%)] pb-28 text-[rgba(245,247,251,0.96)]">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(15,17,26,0.92)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.06)] text-lg font-semibold text-[var(--tertiary)]">
              A
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(255,215,155,0.72)]">
                Community
              </p>
              <h1 className="text-lg font-semibold tracking-[-0.02em] text-white">
                Anything Board
              </h1>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[rgba(212,220,230,0.92)] transition hover:border-[rgba(255,109,0,0.3)] hover:text-white"
          >
            Home
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-col px-5 pb-6 pt-5 sm:px-6">
        <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(135deg,rgba(29,42,106,0.92),rgba(69,90,100,0.88))] p-5 shadow-[0_24px_54px_rgba(0,0,0,0.28)]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(255,215,155,0.78)]">
                Free Talk Feed
              </p>
              <h2 className="max-w-xl text-2xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-3xl">
                불평, 불만, 이용 후기를 자유롭게 남기는 커뮤니티 피드
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-[rgba(226,233,241,0.84)]">
                익명으로 작성되고, 가장 최근 글이 위로 올라옵니다. 원하는
                내용을 검색해서 빠르게 찾아볼 수도 있어요.
              </p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.08)] px-4 py-3 text-right">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[rgba(255,255,255,0.62)]">
                Posts
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {filteredPosts.length}
              </p>
            </div>
          </div>
        </section>

        <section className="pt-5">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[rgba(196,205,218,0.64)]">
              <span aria-hidden="true" className="text-lg">
                ⌕
              </span>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search discussions..."
              className="w-full rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.05)] py-4 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-[rgba(196,205,218,0.46)] focus:border-[rgba(255,109,0,0.4)] focus:bg-[rgba(255,255,255,0.07)]"
            />
          </div>
        </section>

        <nav className="flex gap-3 overflow-x-auto py-5 [scrollbar-width:none]">
          {CATEGORY_TABS.map((tab, index) => {
            const isActive = index === 0;

            return (
              <button
                key={tab}
                type="button"
                className={`whitespace-nowrap rounded-[18px] px-5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[var(--tertiary)] text-[var(--foreground)]"
                    : "border border-white/8 bg-[rgba(255,255,255,0.04)] text-[rgba(205,213,224,0.76)] hover:bg-[rgba(255,255,255,0.08)]"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </nav>

        {isComposerOpen ? (
          <section className="mb-5 rounded-[24px] border border-[rgba(255,109,0,0.24)] bg-[rgba(18,21,33,0.96)] p-5 shadow-[0_20px_48px_rgba(0,0,0,0.28)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(255,215,155,0.72)]">
                  New Post
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  글 작성
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-[rgba(205,213,224,0.76)] transition hover:border-white/20 hover:text-white"
              >
                닫기
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[rgba(230,235,242,0.92)]">
                  제목
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[rgba(196,205,218,0.46)] focus:border-[rgba(255,109,0,0.4)]"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-[rgba(230,235,242,0.92)]">
                  내용
                </span>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="내용을 입력하세요"
                  rows={6}
                  className="w-full resize-none rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[rgba(196,205,218,0.46)] focus:border-[rgba(255,109,0,0.4)]"
                />
              </label>

              {errorMessage ? (
                <p className="text-sm text-[rgba(255,186,155,0.92)]">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#ffd79b_0%,#ff6d00_100%)] px-5 text-sm font-semibold text-[var(--foreground)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "등록 중..." : "등록하기"}
              </button>
            </form>
          </section>
        ) : null}

        <section className="space-y-4">
          {isLoading ? (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-[rgba(255,255,255,0.04)] px-5 py-10 text-center text-sm text-[rgba(205,213,224,0.76)]">
              게시글을 불러오는 중입니다.
            </div>
          ) : paginatedPosts.length > 0 ? (
            paginatedPosts.map((post, index) => (
              <article
                key={post.id}
                className={`rounded-[22px] border p-5 shadow-[0_18px_44px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:border-[rgba(255,109,0,0.22)] ${getPostAccent(index)}`}
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-[8px] bg-[rgba(69,90,100,0.28)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[rgba(212,220,230,0.92)]">
                      Free Talk
                    </span>
                    <span className="text-xs text-[rgba(196,205,218,0.64)]">
                      {formatRelativeTime(post.created_at)}
                    </span>
                  </div>
                  <span className="text-sm text-[rgba(255,215,155,0.86)]">
                    •••
                  </span>
                </div>

                <h3 className="text-lg font-semibold leading-tight text-white">
                  {post.title}
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[rgba(218,225,235,0.82)]">
                  {post.content}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                  <div className="flex items-center gap-4 text-[rgba(196,205,218,0.7)]">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span aria-hidden="true">♡</span>
                      <span>{(post.id % 90) + 24}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span aria-hidden="true">◦</span>
                      <span>{Math.max(3, post.content.length % 21)}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(180,202,214,0.88)]">
                    Anonymous #{String(post.id).padStart(4, "0")}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-[rgba(255,255,255,0.04)] px-5 py-10 text-center text-sm text-[rgba(205,213,224,0.76)]">
              {query
                ? "검색 결과가 없습니다."
                : "아직 작성된 게시글이 없습니다."}
            </div>
          )}
        </section>

        <div className="mt-6 flex items-center justify-between gap-3 rounded-[20px] border border-white/8 bg-[rgba(255,255,255,0.04)] px-4 py-3">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-[rgba(205,213,224,0.76)] transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            이전
          </button>

          <p className="text-sm text-[rgba(205,213,224,0.76)]">
            {currentPage} / {totalPages} 페이지
          </p>

          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage === totalPages}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-[rgba(205,213,224,0.76)] transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsComposerOpen((open) => !open)}
        className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#ffd79b_0%,#ff6d00_100%)] text-xl font-semibold text-[var(--foreground)] shadow-[0_22px_48px_rgba(0,0,0,0.42)] transition active:scale-95 sm:right-8"
      >
        +
      </button>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/8 bg-[rgba(25,27,36,0.88)] px-4 pb-4 pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-around">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-3 py-1 text-[rgba(180,202,214,0.82)] transition hover:text-[rgba(255,215,155,0.96)]"
          >
            <span className="text-lg">⌂</span>
            <span className="text-[11px] font-medium">Home</span>
          </Link>
          <Link
            href="/board"
            className="flex flex-col items-center gap-1 rounded-[14px] bg-[var(--tertiary)] px-4 py-2 text-[var(--foreground)]"
          >
            <span className="text-lg">◎</span>
            <span className="text-[11px] font-semibold">Community</span>
          </Link>
          <Link
            href="/sushi"
            className="flex flex-col items-center gap-1 px-3 py-1 text-[rgba(180,202,214,0.82)] transition hover:text-[rgba(255,215,155,0.96)]"
          >
            <span className="text-lg">◌</span>
            <span className="text-[11px] font-medium">Play</span>
          </Link>
          <Link
            href="/phaser"
            className="flex flex-col items-center gap-1 px-3 py-1 text-[rgba(180,202,214,0.82)] transition hover:text-[rgba(255,215,155,0.96)]"
          >
            <span className="text-lg">▣</span>
            <span className="text-[11px] font-medium">Arcade</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
