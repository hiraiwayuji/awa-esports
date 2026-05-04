import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft, Calendar, Flame, Newspaper, Trophy } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import PageTransition from "@/components/PageTransition";
import { getAllSlugs, getNewsBySlug, type NewsCategory } from "@/lib/news";

type Props = { params: { slug: string } };

const iconFor = (cat: NewsCategory) =>
  cat === "EVENT" ? Flame : cat === "MATCH" ? Trophy : Newspaper;

const colorFor = (cat: NewsCategory) =>
  cat === "EVENT"
    ? "text-awa-magenta border-awa-magenta/40"
    : cat === "MATCH"
      ? "text-awa-warmth border-awa-warmth/40"
      : "text-neon-cyan border-neon-cyan/40";

const mdxComponents = {
  h1: (props: React.ComponentProps<"h1">) => (
    <h1
      className="font-display font-black text-3xl md:text-4xl text-white mt-10 mb-4"
      {...props}
    />
  ),
  h2: (props: React.ComponentProps<"h2">) => (
    <h2
      className="font-display tracking-[0.1em] text-neon-cyan text-lg md:text-xl mt-10 mb-3"
      {...props}
    />
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <h3 className="font-bold text-white text-base md:text-lg mt-6 mb-2" {...props} />
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p className="text-sm md:text-base text-white/75 leading-relaxed my-4" {...props} />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul
      className="list-disc ml-5 space-y-1 text-sm md:text-base text-white/75 leading-relaxed my-4"
      {...props}
    />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol
      className="list-decimal ml-5 space-y-1 text-sm md:text-base text-white/75 leading-relaxed my-4"
      {...props}
    />
  ),
  a: (props: React.ComponentProps<"a">) => (
    <a
      className="text-neon-cyan hover:text-awa-magenta underline-offset-4 hover:underline transition"
      {...props}
    />
  ),
  strong: (props: React.ComponentProps<"strong">) => (
    <strong className="text-white font-bold" {...props} />
  ),
  hr: () => <hr className="my-8 border-white/10" />,
};

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const article = await getNewsBySlug(params.slug);
  if (!article) return {};
  return {
    title: `${article.title} — AWA ESPORTS`,
    description: article.excerpt,
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const article = await getNewsBySlug(params.slug);
  if (!article) notFound();

  const Icon = iconFor(article.category);

  return (
    <PageTransition>
      <article className="relative pt-36 pb-32">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-xs font-display tracking-[0.25em] text-white/50 hover:text-neon-cyan transition mb-8"
          >
            <ArrowLeft size={14} />
            BACK TO NEWS
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div
              className={clsx(
                "w-12 h-12 grid place-items-center rounded-lg border bg-awa-indigo-950/60",
                colorFor(article.category),
              )}
            >
              <Icon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Calendar size={12} />
                <time>{article.displayDate}</time>
              </div>
              <span
                className={clsx(
                  "mt-1 inline-block text-[10px] font-display tracking-[0.3em]",
                  colorFor(article.category),
                )}
              >
                {article.category}
              </span>
            </div>
          </div>

          <h1 className="font-display font-black text-3xl md:text-5xl text-white leading-tight mb-4">
            {article.title}
          </h1>
          <p className="text-base md:text-lg text-white/60 leading-relaxed border-l-2 border-neon-cyan/50 pl-4">
            {article.excerpt}
          </p>

          {(article.participants || article.partners) && (
            <div className="mt-8 flex flex-wrap gap-3 text-xs text-white/50">
              {article.participants && (
                <span className="px-3 py-1 rounded-full border border-white/10 bg-awa-indigo-900/40">
                  参加人数：{article.participants}名
                </span>
              )}
              {article.partners?.map((p) => (
                <span
                  key={p}
                  className="px-3 py-1 rounded-full border border-white/10 bg-awa-indigo-900/40"
                >
                  協力：{p}
                </span>
              ))}
            </div>
          )}

          <div className="mt-10">
            <MDXRemote
              source={article.body}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                },
              }}
            />
          </div>

          <div className="mt-16 pt-6 border-t border-white/10">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-xs font-display tracking-[0.25em] text-white/50 hover:text-neon-cyan transition"
            >
              <ArrowLeft size={14} />
              BACK TO NEWS
            </Link>
          </div>
        </div>
      </article>
    </PageTransition>
  );
}
