import type { Metadata } from "next";
import UseCaseLibrary from "../components/UseCaseLibrary";

export const metadata: Metadata = {
  title: "Example use cases | Micro Titan",
  description:
    "Example use cases for Micro Titan agent setups, by lane: Family, Solo, and Business. Examples are possibilities for discovery to confirm, not promised integrations.",
};

export default function UseCasesPage() {
  return <UseCaseLibrary />;
}
