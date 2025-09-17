import { useRef } from "react";
import Hero from "./components/hero";
import Navbar from "./components/navbar";
import Skills from "./components/skills";
import SocialMedia from "./components/socialmedia";
import Porjects from "./components/projects";

function App() {
  const heroHref = useRef(null);
  const skillsHref = useRef(null);
  const projectsHref = useRef(null);

  return (
    <>
      <div className="flex justify-center items-center">
        <div className="flex  flex-col w-full h-svh">
          <Navbar refs={{ heroHref, skillsHref, projectsHref }} />
          <section ref={heroHref}>
            <Hero />
          </section>
          <section ref={skillsHref}>
            <Skills />
          </section>
          <section ref={projectsHref}>
            <Porjects />
          </section>
          <SocialMedia />
        </div>
      </div>
    </>
  );
}

export default App;
