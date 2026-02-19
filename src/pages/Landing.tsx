import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { About } from '@/components/landing/About';
import { Features } from '@/components/landing/Features';
import { UseCases } from '@/components/landing/UseCases';
import { FAQ } from '@/components/landing/FAQ';
import { Contact } from '@/components/landing/Contact';
import { Footer } from '@/components/landing/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 relative">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none z-0 dark:mix-blend-screen mix-blend-multiply invert dark:invert-0 overflow-visible">
        <img
          src="/src/assets/landing-bg-minimal.png"
          alt="Background Decoration"
          className="w-full h-auto object-cover object-top opacity-30 [mask-image:linear-gradient(to_bottom,black_20%,transparent_100%)]"
        />
      </div>
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <About />
        <Features />
        <UseCases />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
