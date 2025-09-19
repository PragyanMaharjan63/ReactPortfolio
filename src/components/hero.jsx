import ScrollWid from "./scrollwidget";

export default function Hero() {
  return (
    <>
      <div
        style={{ fontFamily: "'Lexend Deca', 'sans-serif'" }}
        className="flex 
        gap-y-4
        flex-col justify-center items-center h-screen"
      >
        <p className="font-light text-sm -translate-x-10 sm:-translate-x-30">
          HI, I AM
        </p>
        <div className="font-extrabold transition-all text-6xl  sm:text-9xl drop-shadow-2xl drop-shadow-neutral-900/60 ">
          PRAGYAN
        </div>
        <p className="font-light text-sm translate-x-10 sm:translate-x-40">
          FRONT END DEVELOPER
        </p>
      </div>
      <div className="rotate-90 absolute -bottom-30 lg:bottom-30 -right-20 lg:right-0">
        <ScrollWid bar={"bottom"} />{" "}
      </div>
    </>
  );
}
