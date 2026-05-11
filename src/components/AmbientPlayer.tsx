import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "ambient_dismissed";
const AUDIO_SRC = "/audio/ambient.mp3";

const AmbientPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;

    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = 1.0;
    audio.preload = "auto";
    audio.load();
    audioRef.current = audio;

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      cleanupListeners();
      setVisible(true);
      audio.play().catch(() => {
        started = false;
        setVisible(false);
      });
    };

    const events: (keyof WindowEventMap)[] = ["pointerdown", "mousedown", "click", "keydown", "wheel", "touchstart"];
    const cleanupListeners = () => events.forEach(e => window.removeEventListener(e, start));
    events.forEach(e => window.addEventListener(e, start, { passive: true }));

    return () => {
      cleanupListeners();
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  const dismiss = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes amb-bar1 { 0%,100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }
        @keyframes amb-bar2 { 0%,100% { transform: scaleY(0.7); } 40% { transform: scaleY(0.25); } 80% { transform: scaleY(0.95); } }
        @keyframes amb-bar3 { 0%,100% { transform: scaleY(0.5); } 30% { transform: scaleY(1); } 70% { transform: scaleY(0.4); } }
        .amb-btn { background: rgba(4,11,43,0.55); border: 1px solid rgba(97,162,254,0.25); }
        .amb-btn:hover { background: rgba(4,11,43,0.85); border-color: rgba(97,162,254,0.6); }
        .amb-btn:hover .amb-x { opacity: 1; }
        .amb-btn:hover .amb-bars { opacity: 0.4; }
      `}</style>
      <button
        onClick={dismiss}
        aria-label="Stop ambient music"
        title="Stop music"
        style={{
          position: "fixed", top: 22, right: 24, zIndex: 200,
          width: 40, height: 40, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", padding: 0, transition: "background 0.2s, border-color 0.2s",
          backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        }}
        className="amb-btn"
      >
        <span className="amb-bars" style={{ display: "flex", alignItems: "center", gap: 3, height: 16, transition: "opacity 0.2s" }}>
          <span style={{ width: 3, height: "100%", background: "#61A2FE", borderRadius: 2, transformOrigin: "center", animation: "amb-bar1 1s ease-in-out infinite" }} />
          <span style={{ width: 3, height: "100%", background: "#61A2FE", borderRadius: 2, transformOrigin: "center", animation: "amb-bar2 1.3s ease-in-out infinite" }} />
          <span style={{ width: 3, height: "100%", background: "#61A2FE", borderRadius: 2, transformOrigin: "center", animation: "amb-bar3 0.9s ease-in-out infinite" }} />
        </span>
        <span className="amb-x" style={{
          position: "absolute", color: "#61A2FE", fontSize: 18, lineHeight: 1,
          opacity: 0, transition: "opacity 0.2s", pointerEvents: "none",
        }}>×</span>
      </button>
    </>
  );
};

export default AmbientPlayer;
