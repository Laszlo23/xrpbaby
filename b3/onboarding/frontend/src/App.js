import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Hero from "./sections/Hero";
import Problem from "./sections/Problem";
import Vision from "./sections/Vision";
import Ecosystem from "./sections/Ecosystem";
import CultureLayer from "./sections/CultureLayer";
import BCD from "./sections/BCD";
import Impact from "./sections/Impact";
import Investors from "./sections/Investors";
import Future from "./sections/Future";
import FinalCTA from "./sections/FinalCTA";
import { trackEvent } from "./lib/bcApi";

const Landing = () => {
  useEffect(() => {
    trackEvent("page_view", "landing", { path: "/" });
  }, []);

  return (
    <div className="App min-h-screen bg-[#050505] text-white antialiased">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Vision />
        <Ecosystem />
        <CultureLayer />
        <BCD />
        <Impact />
        <Investors />
        <Future />
        <FinalCTA />
      </main>
      <Footer />
      <Toaster theme="dark" position="bottom-center" />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
