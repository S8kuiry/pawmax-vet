"use client";

import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: Record<string, unknown>,
    ) => {
      dispose: () => void;
      addListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

type Props = {
  roomName: string;
  displayName: string;
  email?: string;
  onHangup?: () => void;
};

const JITSI_DOMAIN = process.env.NEXT_PUBLIC_JITSI_DOMAIN || "meet.jit.si";
const SCRIPT_SRC = `https://${JITSI_DOMAIN}/external_api.js`;

function loadJitsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("ssr"));
    if (window.JitsiMeetExternalAPI) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    if (existing) {
      if (window.JitsiMeetExternalAPI) return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("jitsi script failed")), {
        once: true,
      });
      return;
    }

    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("jitsi script failed"));
    document.head.appendChild(s);
  });
}

export default function JitsiCall({ roomName, displayName, email, onHangup }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<{ dispose: () => void; addListener: (e: string, h: (...args: unknown[]) => void) => void } | null>(
    null,
  );
  const onHangupRef = useRef(onHangup);
  const hangupCalledRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const jitsiRoom = `petcare-${roomName}`;

  useEffect(() => {
    onHangupRef.current = onHangup;
  }, [onHangup]);

  const triggerHangup = useCallback(() => {
    if (hangupCalledRef.current) return;
    hangupCalledRef.current = true;
    onHangupRef.current?.();
  }, []);

  useEffect(() => {
    let cancelled = false;
    hangupCalledRef.current = false;

    loadJitsiScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return;

        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: jitsiRoom,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          userInfo: { displayName, email: email ?? "" },
          configOverwrite: {
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            enableClosePage: false,
          },
          interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "desktop",
              "fullscreen",
              "hangup",
              "raisehand",
              "tileview",
              "settings",
            ],
          },
        });

        apiRef.current = api;
        api.addListener("videoConferenceJoined", () => {
          if (!cancelled) setStatus("ready");
        });
        api.addListener("readyToClose", () => triggerHangup());
        api.addListener("videoConferenceLeft", () => triggerHangup());
      })
      .catch((err) => {
        console.error("Failed to load Jitsi:", err);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      try {
        apiRef.current?.dispose();
      } catch {
        /* noop */
      }
      apiRef.current = null;
    };
  }, [jitsiRoom, displayName, email, triggerHangup]);

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-none lg:rounded-2xl overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 z-10" />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 z-0">
          Connecting to video…
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 z-20 p-6 text-center">
          <p className="font-medium">Video could not start</p>
          <p className="text-sm text-slate-400 mt-2">
            Check camera/mic permissions and refresh. Chat still works alongside.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
