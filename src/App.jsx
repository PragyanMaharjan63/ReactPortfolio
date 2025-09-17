import { useRef } from "react";
import Hero from "./components/hero";
import Navbar from "./components/navbar";
import Skills from "./components/skills";
import SocialMedia from "./components/socialmedia";
import Porjects from "./components/projects";

function App() {
  const heroHref = useRef(null);
  const skillsHref = useRef(null);

  return (
    <>
      <div className="flex justify-center items-center">
        <div className="flex  flex-col w-full">
          <Navbar refs={{ heroHref, skillsHref }} />
          <section ref={heroHref}>
            <Hero />
          </section>
          <section ref={skillsHref}>
            <Skills />
          </section>
          <section>
            <Porjects />
          </section>
          <SocialMedia />
        </div>
      </div>
    </>
  );
}

export default App;
