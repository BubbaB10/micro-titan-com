import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PitchSheet from "../../components/PitchSheet";
import { PITCH_SHEETS, PITCH_SLUGS } from "../pitch-sheets";
import "../pitch.css";

export function generateStaticParams() {
  return PITCH_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sheet = PITCH_SHEETS[slug];
  if (!sheet) return { title: "Pitch sheet | Micro Titan" };
  return {
    title: `${sheet.clientName} pitch sheet | Micro Titan`,
    description: `Micro Titan ${sheet.lane} pitch sheet for ${sheet.clientName}: example use cases, setup flow, and pricing. Examples are illustrative, not promised outcomes.`,
  };
}

export default async function PitchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sheet = PITCH_SHEETS[slug];
  if (!sheet) notFound();
  return <PitchSheet sheet={sheet} />;
}
