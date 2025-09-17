export default function Navbar() {
  return (
    <>
      <div
        style={{ fontFamily: "'Poppins','sans-serif'" }}
        className="flex justify-between w-full fixed p-5 sm:p-10 backdrop-blur-xl z-10"
      >
        <div>
          <img src="/penguin.png" alt="logo" className="size-10 " />
        </div>
        <div className="flex gap-x-4 sm:gap-x-15 items-center list-none sm:mr-5">
          <li>SKILLS</li>
          <li>PROJECTS</li>
          <li>CONTACT</li>
        </div>
      </div>
    </>
  );
}
