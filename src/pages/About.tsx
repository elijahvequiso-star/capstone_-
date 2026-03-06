import { Link } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
// You can use a different image or the same hero one – ideally something architectural/blueprint/cranes/skyline

import aboutHeroImg from "@/assets/hero-construction.jpg";

const About = () => {
  return (
    <div className="relative bg-gray-950 text-white">
      {/* Navbar */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={aboutHeroImg}
            alt="Modern architectural skyline with cranes at dusk"
            className="h-full w-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />
        </div>

        <div className="relative z-10 max-w-5xl px-6 text-center">
          <h1
            className="animate-fade-in-up font-heading text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
            style={{ animationDelay: "0.1s" }}
          >
            About VEQUISO
          </h1>
          <p
            className="mt-6 mx-auto max-w-3xl text-xl font-medium tracking-wide text-white/90 md:text-2xl"
            style={{ animationDelay: "0.3s" }}
          >
            Building Tomorrow with Precision and Vision
          </p>
        </div>

        {/* Subtle scroll indicator */}
        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 animate-bounce opacity-60">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24 items-center">
            {/* Left: Story */}
            <div className="space-y-8">
              <h2 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
                Who We Are
              </h2>
              <p className="text-lg leading-relaxed text-gray-300">
                VEQUISO was founded with a singular purpose: to elevate the standards of construction and development through unwavering commitment to quality, innovation, and integrity.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                From foundational groundwork to iconic skylines, we approach every project as a legacy — blending cutting-edge engineering, sustainable practices, and timeless design to create spaces that inspire and endure.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                Today, we stand as a trusted partner for visionary developers, institutions, and communities across the region, delivering excellence on time and beyond expectation.
              </p>
            </div>

            {/* Right: Image or visual break */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://thumbs.dreamstime.com/z/architect-builders-looking-buiding-plan-blueprint-wearing-hardhat-meeting-construction-site-team-engineers-95361415.jpg" // or your asset
                alt="Construction team reviewing plans on site"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-xl font-semibold">Precision. Collaboration. Excellence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
              Our Core Principles
            </h2>
            <p className="mt-4 text-xl text-gray-400 max-w-3xl mx-auto">
              The foundation of everything we build
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                title: "Integrity",
                desc: "We honor our commitments, maintain transparency, and build lasting trust with every stakeholder.",
              },
              {
                title: "Innovation",
                desc: "Embracing advanced technology, sustainable methods, and creative design to push boundaries.",
              },
              {
                title: "Excellence",
                desc: "Uncompromising quality in materials, craftsmanship, and execution — every detail matters.",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="group relative rounded-2xl bg-gray-900/60 backdrop-blur-sm p-8 border border-gray-800 hover:border-amber-700/50 transition-all duration-500 hover:shadow-xl"
                style={{ animationDelay: `${i * 0.1 + 0.2}s` }}
              >
                <h3 className="font-heading text-2xl font-bold text-amber-500 mb-4">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-8">
            Ready to Build Something Extraordinary?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Partner with VEQUISO to turn your vision into enduring reality.
          </p>
          <Link
            to="/login" // or /signup /projects — adjust as needed
            className={`
              inline-flex items-center justify-center 
              rounded-full bg-gradient-to-r from-amber-600 to-yellow-600 
              px-12 py-5 font-heading text-xl font-semibold text-white 
              shadow-xl transition-all duration-500 
              hover:scale-105 hover:shadow-2xl hover:from-amber-700 hover:to-yellow-700
            `}
          >
            Wanna get started !! →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;