import Hero from "./components/hero";
import Navbar from "./components/navbar";
import Skills from "./components/skills";
import SocialMedia from "./components/socialmedia";

function App() {
  return (
    <>
      <div className="flex justify-center items-center">
        <div className="flex  flex-col w-full">
          <Navbar />
          <Hero />
          <Skills />
          <SocialMedia />
        </div>
      </div>
    </>
  );
}

export default App;
