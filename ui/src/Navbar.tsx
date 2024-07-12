import { ClipboardCopy } from "lucide-react";

interface NavbarProps {
  copyRef: React.RefObject<HTMLButtonElement>;
}

export function Navbar({ copyRef }: NavbarProps) {
  return (
    <div className="p-1 flex justify-between items-center">
      <h1 className="title ps-3 text-base font-normal">tailwind.config.js</h1>
      <button className="copy-button p-2 bg-transparent" ref={copyRef}>
        <ClipboardCopy size={20} strokeWidth={1.50} />
      </button>
    </div>
  );
}
