export default function Navbar() {
  return (
    <>
      <div
        style={{ fontFamily: "'Poppins','sans-serif'" }}
        className="flex justify-between w-full fixed p-10"
      >
        <div>
          <img src="/penguin.png" alt="logo" className="size-10 " />
        </div>
        <div className="flex gap-x-4 items-center list-none mr-5">
          <li>Skills</li>
          <li>Projects</li>
          <li>Contact</li>
        </div>
      </div>
    </>
  );
}
