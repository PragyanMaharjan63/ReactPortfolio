export default function Skills() {
  const language = [
    { id: 1, lang: "HTML", imag: "/public/icons/html.png" },
    { id: 2, lang: "CSS", imag: "/public/icons/css-3.png" },
    { id: 3, lang: "TailwindCSS", imag: "/public/icons/tailwind.svg" },
    { id: 4, lang: "Javascript", imag: "/public/icons/js.png" },
    { id: 5, lang: "React", imag: "/public/icons/react.svg" },
  ];
  return (
    <>
      <div
        style={{ fontFamily: "'Lexend Deca', 'sans-serif'" }}
        className="flex 
        gap-y-4
        flex-col items-center mb-20"
      >
        {" "}
        <p className="text-3xl font-extrabold drop-shadow-xl drop-shadow-neutral-900/60 mt-30 mb-20">
          SKILLS
        </p>
        <div className="flex justify-evenly grow flex-col sm:flex-row gap-y-10 w-full">
          {language.map((item) => {
            return (
              <div key={item.id} className="flex flex-col items-center">
                <img className="size-15" src={item.imag} alt="imag" />
                <p>{item.lang}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
