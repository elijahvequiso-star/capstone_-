import { Link } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import heroImg from "@/assets/hero-construction.jpg";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      {/* Hero Background */}
      <div className="absolute inset-0">
        <img src={heroImg} alt="Construction site" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/80" />
      </div>

      <PublicNavbar />

      {/* Hero Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="animate-fade-in font-heading text-5xl font-black uppercase tracking-wider text-primary-foreground md:text-7xl">
          VEQUISO
        </h1>
        <p className="mt-2 animate-fade-in font-heading text-lg font-semibold tracking-widest text-primary md:text-xl" style={{ animationDelay: "0.1s" }}>
          Construction and Development
        </p>
        <p className="mt-6 max-w-2xl animate-fade-in text-base leading-relaxed text-primary-foreground/80 md:text-lg" style={{ animationDelay: "0.2s" }}>
          We Build, Structure, Foundation, Connect, Direct &amp; Drive. VEQUISO is a premier construction and development company committed to delivering exceptional quality, innovative design, and reliable infrastructure solutions.
        </p>
        <Link
          to="/signup"
          className="mt-10 animate-fade-in rounded-xl bg-primary px-10 py-4 font-heading text-lg font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          style={{ animationDelay: "0.3s" }}
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default Index;
