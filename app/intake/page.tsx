import type { Metadata } from "next";
import IntakeForm from "../components/IntakeForm";

export const metadata: Metadata = {
  title: "Start your intake | Micro Titan",
  description:
    "Start your Micro Titan intake: pick Family, Solo entrepreneur, or Business, answer the essentials, and send it to hello@micro-titan.com. Filling it out charges nothing.",
};

export default function IntakePage() {
  return <IntakeForm />;
}
