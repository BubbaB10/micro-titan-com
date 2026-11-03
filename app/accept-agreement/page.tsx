import type { Metadata } from "next";
import AgreementForm from "../components/AgreementForm";

export const metadata: Metadata = {
  title: "Accept the Scope & Terms | Micro Titan",
  description:
    "Accept the Micro Titan Scope and Terms for your lane: your intake reference, client name, lane, and date, with the approved lane totals. One tap sends it directly to hello@micro-titan.com, with an email fallback if the direct send fails. This is not claimed as a legal e-signature, and the full Scope and Terms text is not re-hosted here — please read the Micro Titan Scope and Terms document sent with your intake before accepting.",
};

export default function AcceptAgreementPage() {
  return <AgreementForm />;
}
