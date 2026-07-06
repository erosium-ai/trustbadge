import { redirect } from "next/navigation";

export default function LegacyRegisterRedirectPage() {
  redirect("/auth/register");
}
