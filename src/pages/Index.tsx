import { Link } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import heroImg from "@/assets/hero-construction.jpg";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* Hero Background with subtle gradient overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Modern construction architecture"
          className="h-full w-full object-cover opacity-90"
        />
        {/* Elegant dark-to-transparent gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />
        
        {/* Optional subtle noise / grain texture for premium feel (can remove) */}
        {/* <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.04] mix-blend-soft-light pointer-events-none" /> */}
      </div>

      <PublicNavbar />

      {/* Hero Content – centered, better spacing */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-20 text-center sm:px-8 md:px-12 lg:px-16">
        <div className="max-w-5xl space-y-8 md:space-y-10">
          {/* Main title – bigger, bolder, more dramatic */}
          <h1
            className="animate-fade-in-up font-heading text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
            style={{ animationDelay: "0.1s" }}
          >
            VEQUISO
          </h1>

          {/* Subtitle – elegant, slightly condensed */}
          <p
            className="animate-fade-in-up mx-auto max-w-3xl font-heading text-xl font-medium tracking-wide text-white/90 sm:text-2xl md:text-3xl"
            style={{ animationDelay: "0.25s" }}
          >
            Construction • Development • Innovation
          </p>

          {/* Description – more refined, trustworthy tone */}
          <p
            className="animate-fade-in-up mx-auto max-w-3xl text-base leading-relaxed text-gray-200/90 md:text-lg lg:text-xl"
            style={{ animationDelay: "0.4s" }}
          >
            Crafting enduring structures and visionary spaces with precision, integrity, and forward-thinking design.  
            VEQUISO delivers excellence in every foundation, connection, and milestone.
          </p>

          {/* CTA – premium button with gradient + scale + shadow lift */}
          <div className="pt-6" style={{ animationDelay: "0.55s" }}>
            <Link
              to="/signup"
              className={`
                group relative inline-flex items-center justify-center 
                overflow-hidden rounded-full bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 
                px-10 py-5 font-heading text-lg font-semibold text-white 
                shadow-xl transition-all duration-500 
                hover:scale-105 hover:shadow-2xl hover:from-amber-700 hover:via-yellow-700 hover:to-amber-800
                focus:outline-none focus:ring-4 focus:ring-amber-500/40
              `}
            >
              <span className="relative z-10">Discover Your Project →</span>
              {/* Optional shine effect on hover */}
              <div className="absolute inset-0 scale-x-0 bg-white/20 transition-transform duration-700 group-hover:scale-x-100 origin-left" />
            </Link>
          </div>

          {/* Optional subtle secondary CTA or trust signal */}
          <p className="pt-8 text-sm text-gray-300/70 animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
            Trusted by leading developers • Projects delivered on time & beyond expectation
          </p>
        </div>
      </div>

      {/* Optional: very subtle scrolling indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce opacity-70">
        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
};

export default Index;