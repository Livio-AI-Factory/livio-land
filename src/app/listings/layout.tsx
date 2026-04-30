// MNDA gate: every listing page (browse + detail + create) requires a signed MNDA.
// Admins are exempt (they need access to manage the platform).
import { requireSignedMnda } from "@/lib/mnda-actions";

export default async function ListingsLayout({ children }: { children: React.ReactNode }) {
  await requireSignedMnda();
  return <>{children}</>;
}
