import type { Metadata } from "next";
import { HelpView } from "@/features/help/help-view";

export const metadata: Metadata = { title: "Nasıl kullanılır?" };

export default function HelpPage() {
  return <HelpView />;
}
