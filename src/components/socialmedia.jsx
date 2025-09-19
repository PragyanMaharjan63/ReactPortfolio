import { Github, Linkedin } from "lucide-react";

export default function SocialMedia() {
  return (
    <>
      <div className="flex flex-row sm:flex-col sm:fixed bottom-0 list-none mb-4 ml-2 sm:m-15 gap-4">
        <li
          onClick={() => {
            window.open("https://www.github.com/pragyanmaharjan63", "_blank");
          }}
        >
          <Github className="cursor-pointer hover:scale-110 hover:rotate-3" />
        </li>
        <li
          onClick={() => {
            window.open(
              "https://www.linkedin.com/in/pragyan-maharjan",
              "_blank"
            );
          }}
        >
          <Linkedin className="cursor-pointer hover:scale-110 hover:rotate-3" />
        </li>
      </div>
    </>
  );
}
