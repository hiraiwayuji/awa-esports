import { redirect } from "next/navigation";

// スポンサー・応援パートナーのページは /sponsor に統合。
// 旧URL（/partners）からのアクセスは恒久的に /sponsor へ転送する。
export default function PartnersRedirect() {
  redirect("/sponsor");
}
