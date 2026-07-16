import { notFound } from "next/navigation";
import PracticeEventPage from "@/components/PracticeEventPage";
import { getPracticeEvent } from "@/lib/practice-events";

// 開催情報は lib/practice-events.ts の "0906" を編集してください。
export default function Event0906Page() {
  const event = getPracticeEvent("0906");
  if (!event) notFound();
  return <PracticeEventPage event={event} />;
}
