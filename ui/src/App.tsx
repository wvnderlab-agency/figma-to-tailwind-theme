import { useEffect, useRef } from "react";
import { Navbar } from "./Navbar";

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
    <main className="flex flex-col h-full">
      <Navbar copyRef={copyRef} />
      <textarea
        readOnly
        ref={configRef}
        className="config p-3 flex-1 resize-none font-mono text-xs"
        id="config"
      ></textarea>
    </main>
  );
}

export default App;
