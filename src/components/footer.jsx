export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="shell flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-8">
        <p className="label">Pragyan Maharjan</p>
        <p className="label">© {new Date().getFullYear()} · Built with React</p>
      </div>
    </footer>
  );
}
