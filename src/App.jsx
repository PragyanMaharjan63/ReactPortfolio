import { useRef } from "react";
import Hero from "./components/hero";
import Navbar from "./components/navbar";
import Skills from "./components/skills";
import SocialMedia from "./components/socialmedia";
import Porjects from "./components/projects";
import Contact from "./components/contact";

function App() {
  const heroHref = useRef(null);
  const skillsHref = useRef(null);
  const projectsHref = useRef(null);
  const contactHref = useRef(null);

  return (
    <>
      <div className="flex justify-center items-center">
        <div className="flex  flex-col w-full h-svh">
          <Navbar refs={{ heroHref, skillsHref, projectsHref, contactHref }} />
          <section ref={heroHref}>
            <Hero />
          </section>
          <section ref={skillsHref}>
            <Skills />
          </section>
          <section ref={projectsHref} className="sm:scroll-mt-20">
            <Porjects />
          </section>
          <section ref={contactHref}>
            <Contact />
          </section>
          <section className="hidden sm:block">
            <SocialMedia />
          </section>
        </div>
      </div>
    </>
  );
}

export default App;
