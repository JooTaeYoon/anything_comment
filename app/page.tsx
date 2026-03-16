import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8efe6_0%,#fffaf4_50%,#f3ebe2_100%)] px-6 py-12 text-stone-900">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-4xl items-center justify-center">
        <section className="w-full rounded-[32px] border border-stone-200/80 bg-white/90 p-8 shadow-[0_28px_90px_rgba(41,37,36,0.12)] backdrop-blur sm:p-12">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              Welcome
            </p>
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
