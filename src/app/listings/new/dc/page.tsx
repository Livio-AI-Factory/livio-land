// DC capacity listings have been retired — Livio Land is powered-land only.
// Anyone hitting the old /listings/new/dc URL gets redirected to the land
// flow instead of accidentally creating a DC draft.
import { redirect } from "next/navigation";

export default function RetiredNewDcListingPage() {
  redirect("/listings/new/land");
}
