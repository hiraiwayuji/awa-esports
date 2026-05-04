import SectionTitle from "@/components/SectionTitle";
import PageTransition from "@/components/PageTransition";
import NewsList from "@/components/NewsList";
import { getAllNews } from "@/lib/news";

export const metadata = {
  title: "News & Events — AWA ESPORTS",
  description:
    "AWA ESPORTS の練習会・大会参戦・メディア出演などの最新情報をお届けします。",
};

export default async function NewsPage() {
  const items = await getAllNews();

  return (
    <PageTransition>
      <section className="relative pt-36 pb-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionTitle
            eyebrow="NEWS & EVENTS"
            title="最新の動きを、ここから。"
            subtitle={
              <>
                練習会、大会参戦、メディア出演。
                <br />
                AWA ESPORTSの全ての挑戦を、リアルタイムでお届けします。
              </>
            }
          />
          <NewsList items={items} />
        </div>
      </section>

      <section className="pb-32" />
    </PageTransition>
  );
}
