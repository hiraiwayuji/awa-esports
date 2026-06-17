import { redirect } from "next/navigation";

// メンバー入口は連絡板に集約。/member は連絡板へ転送する。
export default function MemberRedirect() {
  redirect("/board");
}
