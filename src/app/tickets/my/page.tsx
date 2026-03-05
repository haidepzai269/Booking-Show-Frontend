import { redirect } from "next/navigation";

/**
 * /tickets/my → redirect về /profile/tickets
 * Tránh conflict với dynamic route /tickets/[id] khi id = "my"
 */
export default function TicketsMyPage() {
  redirect("/profile/tickets");
}
