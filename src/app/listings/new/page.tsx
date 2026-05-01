// Livio Land is powered-land only. The DC-capacity option has been retired
// from the user-facing flow, so /listings/new just sends suppliers straight
// to the powered-land creation flow.
import { redirect } from "next/navigation";

export default function NewListingPage() {
  redirect("/listings/new/land");
}
