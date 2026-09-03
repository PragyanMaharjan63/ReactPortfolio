import { Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import HomePage from "@/pages/HomePage";
import WorkPage from "@/pages/WorkPage";
import ProjectPage from "@/pages/ProjectPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

function RouteFallback() {
  return (
    <div className="section">
      <div className="shell">
        <p className="label" role="status" aria-live="polite">
          Loading…
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="main">
        <Suspense fallback={<RouteFallback />}>
          <Routes key={pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/projects/:slug" element={<ProjectPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
