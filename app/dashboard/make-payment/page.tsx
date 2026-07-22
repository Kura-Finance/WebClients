import { redirect } from "next/navigation";

export default function MakePaymentRedirectPage() {
  redirect("/dashboard/approvals");
}
