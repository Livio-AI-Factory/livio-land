// DC capacity browse retired — Livio Land is land-only. Old links redirect
// to the powered-land marketplace instead of 404ing.
import { redirect } from "next/navigation";

export default function RetiredDcBrowsePage() {
  redirect("/listings/land");
}
