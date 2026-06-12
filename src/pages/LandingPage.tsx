import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Problem from '../components/Problem';
import Features from '../components/Features';
import Demo from '../components/Demo';
import AIAssistant from '../components/AIAssistant';
import Leaderboard from '../components/Leaderboard';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">

      {/* ── Global ambient background blobs (fixed) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[35%] -left-[15%] w-[75%] h-[75%] rounded-full bg-accentBlue/[0.06] blur-[130px]" />
        <div className="absolute top-[15%] -right-[15%] w-[60%] h-[60%] rounded-full bg-accentPurple/[0.06] blur-[120px]" />
        <div className="absolute bottom-[5%] left-[15%] w-[65%] h-[65%] rounded-full bg-primaryGlow/[0.04] blur-[140px]" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Problem />
          <Features />
          <Demo />
          <AIAssistant />
          <Leaderboard />
          <CTA />
        </main>
        <Footer />
      </div>

    </div>
  );
};

export default LandingPage;
