import { useEffect, useState } from "react";

export default function ScrollWid({ bar }) {
  const [top, setTop] = useState(false);
  const [bottom, setBottom] = useState(false);
  useEffect(() => {
    if (bar === "top") {
      setTop(true);
    } else if (bar === "bottom") {
      setBottom(true);
    } else if (bar === "both") {
      setTop(true);
      setBottom(true);
    } else {
      setTop(false);
      setBottom(false);
    }
  }, [bar]);
  return (
    <>
      <div className="flex items-center gap-x-6 text-neutral-600">
        {top && <span className="border-neutral-600 border-1 w-15 h-0" />}{" "}
        <div style={{ fontFamily: "'Poppins','sans-serif'" }}>SCROLL</div>
        {bottom && <span className="border-neutral-600 border-1 w-15 h-0" />}
      </div>
    </>
  );
}
