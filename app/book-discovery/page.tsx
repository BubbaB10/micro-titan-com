import type { Metadata } from "next";
import BookDiscoveryForm from "../components/BookDiscoveryForm";

export const metadata: Metadata = {
  title: "Book discovery | Micro Titan",
  description:
    "Send a discovery booking request to hello@micro-titan.com: your intake reference, lane, and up to 3 preferred date/times in America/Chicago. Preferred times are preferences only, not confirmed availability. One tap sends it directly, with an email fallback if the direct send fails; this page makes no calendar booking.",
};

export default function BookDiscoveryPage() {
  return <BookDiscoveryForm />;
}
