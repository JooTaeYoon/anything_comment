"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Post = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

const POSTS_PER_PAGE = 3;

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const paginatedPosts = posts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );

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
          "message" in data ? data.message ?? "Failed to create board" : "Failed to create board",
        );
      }

      setPosts((currentPosts) => [data, ...currentPosts]);
      setCurrentPage(1);
      setTitle("");
      setContent("");
    } catch (error) {
      console.error(error);
      setErrorMessage("게시글을 저장하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6efe8_0%,#fffdf8_52%,#f4f1ea_100%)] px-4 py-10 text-stone-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="rounded-[32px] border border-stone-200/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(41,37,36,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
                Board
              </p>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
                  제목과 내용으로 작성하는 게시판
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-stone-600">
                  글을 작성하면 아래 목록의 가장 위에 바로 추가됩니다.
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full border border-stone-300 px-5 text-sm font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-950"
            >
              홈으로
            </Link>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <section className="rounded-[28px] bg-stone-950 p-6 text-stone-50 shadow-[0_18px_50px_rgba(28,25,23,0.22)]">
            <div className="mb-6 space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">글 작성</h2>
              <p className="text-sm leading-6 text-stone-300">
                제목과 내용을 모두 입력한 뒤 등록하세요.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-200">제목</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-500"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-200">내용</span>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="내용을 입력하세요"
                  rows={8}
                  className="w-full resize-none rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-amber-500"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-amber-400 px-5 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "등록 중..." : "등록하기"}
              </button>
            </form>

            {errorMessage ? (
              <p className="mt-4 text-sm text-amber-300">{errorMessage}</p>
            ) : null}
          </section>

          <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(28,25,23,0.08)]">
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
                  게시글 목록
                </h2>
                <p className="text-sm text-stone-500">
                  총 {posts.length}개의 게시글
                </p>
              </div>
              <p className="text-sm text-stone-500">
                {currentPage} / {totalPages} 페이지
              </p>
            </div>

            {isLoading ? (
              <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 px-5 py-10 text-center text-sm text-stone-500">
                게시글을 불러오는 중입니다.
              </div>
            ) : paginatedPosts.length > 0 ? (
              <>
                <div className="space-y-4">
                  {paginatedPosts.map((post) => (
                    <article
                      key={post.id}
                      className="rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4"
                    >
                      <h3 className="text-lg font-semibold text-stone-950">
                        {post.title}
                      </h3>
                      <div className="relative mt-3 overflow-hidden rounded-2xl bg-white/70 px-4 py-3">
                        <p className="max-h-16 overflow-hidden whitespace-pre-wrap text-sm leading-6 text-stone-700">
                          {post.content}
                        </p>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-stone-50 via-stone-50/90 to-transparent" />
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-stone-200 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage === 1}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-stone-300 px-4 text-sm font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    이전
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    const isActive = pageNumber === currentPage;

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                          isActive
                            ? "bg-stone-950 text-white"
                            : "border border-stone-300 text-stone-700 hover:border-stone-900 hover:text-stone-950"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-stone-300 px-4 text-sm font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    다음
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 px-5 py-10 text-center text-sm text-stone-500">
                아직 작성된 게시글이 없습니다.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
