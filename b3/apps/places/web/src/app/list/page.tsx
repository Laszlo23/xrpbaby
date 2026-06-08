import type { Metadata } from "next";
import { ListWizard } from "@/components/rwa/ListWizard";

export const metadata: Metadata = {
  title: "List a property — Building Culture RWA",
  description: "Tokenize and list real estate on Building Culture marketplace.",
};

export default function ListPage() {
  return <ListWizard />;
}
