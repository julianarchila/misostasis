import { routes } from "@/lib/routes";
import { redirect } from "next/navigation";

export default function BusinessPage() {
  redirect(routes.business.root);
}
