import { ClipboardCopy } from "lucide-react";

interface NavbarProps {
  copyRef: React.RefObject<HTMLButtonElement>;
}

export function Navbar({ copyRef }: NavbarProps) {
  return (
    <div className="navbar">
      <h1 className="title">tailwind.config.js</h1>
      <button className="copy-button" ref={copyRef}>
        <ClipboardCopy size={20} strokeWidth={1.50} />
      </button>
    </div>
  );
}
