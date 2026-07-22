import { redirect } from "next/navigation";

/** Legacy Swap route → Crypto markets. */
export default function SwapRedirectPage() {
  redirect("/dashboard/markets");
}
