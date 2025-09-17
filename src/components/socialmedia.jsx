import { Github, Linkedin } from "lucide-react";

export default function SocialMedia() {
  return (
    <>
      <div className="flex flex-col fixed bottom-0 list-none m-7 sm:m-15 gap-y-4">
        <li
          onClick={() => {
            window.open("https://www.github.com/pragyanmaharjan63", "_blank");
          }}
        >
          <Github />
        </li>
        <li
          onClick={() => {
            window.open(
              "https://www.linkedin.com/in/pragyan-maharjan",
              "_blank"
            );
          }}
        >
          <Linkedin />
        </li>
      </div>
    </>
  );
}
