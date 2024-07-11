import { useEffect, useRef } from "react";

function App() {
  const configRef = useRef<HTMLTextAreaElement | null>(null);
  const copyRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (copyRef.current) {
      copyRef.current.addEventListener("click", (event) => {
        configRef.current?.select();
        document.execCommand("copy");
        parent.postMessage(
          { pluginMessage: "notify", message: "Copied to clipboard" },
          "*",
        );
      });
    }
  }, []);

  useEffect(() => {
    parent.postMessage({ pluginMessage: "generate" }, "*");
    window.addEventListener("message", (event) => {
      const config = event.data.pluginMessage;
      if (configRef.current) {
        configRef.current.innerHTML = config;
      }
    });
  }, []);

  return (
    <main className="container">
      <div className="navbar">
        <h1 className="title">tailwind.config.js</h1>
        <button className="copy-button" ref={copyRef}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-clipboard-copy"
          >
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            <path d="M16 4h2a2 2 0 0 1 2 2v4" />
            <path d="M21 14H11" />
            <path d="m15 10-4 4 4 4" />
          </svg>
        </button>
      </div>
      <textarea
        readOnly
        ref={configRef}
        className="config"
        id="config"
      ></textarea>
    </main>
  );
}

export default App;
