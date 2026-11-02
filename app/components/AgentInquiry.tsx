"use client";
import { useState } from "react";

export default function AgentInquiry() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("Family");
  const [agent, setAgent] = useState("Muse by Meta");
  const [message, setMessage] = useState("");
  const body = `Name: ${name}\nEmail: ${email}\nTier: ${tier}\nAgent preference: ${agent}\n\n${message}`;
  const href = `mailto:hello@micro-titan.com?subject=${encodeURIComponent("Agent setup inquiry")}&body=${encodeURIComponent(body)}`;
  return (
    <div className="quote-summary" style={{ marginTop: 40 }}>
      <p className="eyebrow">START WITH AGENT SETUP</p>
      <h3>Tell us your tier and agent preference</h3>
      <p className="fine-print">Fill this in, then choose “Send inquiry”. That opens your email app with everything pre-filled — nothing is sent until you send it yourself. Email us directly at hello@micro-titan.com if you prefer.</p>
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label style={{ fontSize: 14 }}>Name<br /><input required value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 4 }} /></label>
        <label style={{ fontSize: 14 }}>Email<br /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 4 }} /></label>
        <label style={{ fontSize: 14 }}>Tier<br /><select value={tier} onChange={(e) => setTier(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 4 }}><option>Family</option><option>Solo entrepreneur</option><option>Business</option></select></label>
        <label style={{ fontSize: 14 }}>Agent preference<br /><select value={agent} onChange={(e) => setAgent(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 4 }}><option>Muse by Meta</option><option>Grok Bot by Grok</option><option>Claude by Anthropic</option><option>Gemini by Google</option><option>Not sure — recommend one in discovery</option></select></label>
        <label style={{ fontSize: 14 }}>What are you trying to do?<br /><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} style={{ width: "100%", padding: 10, marginTop: 4 }} /></label>
        <a className="button" href={href}>Send inquiry ↗</a>
        <p className="fine-print">Prices above are the agent-setup tiers. Websites, custom software, SEO, and marketing are separate services, scoped separately.</p>
      </div>
    </div>
  );
}
