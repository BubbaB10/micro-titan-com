import Nav from "./components/Nav";
import HomePageClient from "./components/HomePageClient";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-[#f4f7fa]">
      <Nav />
      <HomePageClient />
    </div>
  );
}
