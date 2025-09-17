export default function Hero() {
  return (
    <>
      <div
        style={{ fontFamily: "'Alatsi', 'sans-serif'" }}
        className="flex 
        gap-y-4
        flex-col justify-center items-center h-screen"
      >
        <p className="font-thin text-sm -translate-x-10 sm:-translate-x-30">
          HI, I AM
        </p>
        <div className="font-bold transition-all text-6xl  sm:text-9xl drop-shadow-2xl ">
          PRAGYAN
        </div>
        <p className="font-thin text-sm translate-x-10 sm:translate-x-40">
          FRONT END DEVELOPER
        </p>
      </div>
    </>
  );
}
