import { useEffect, useImperativeHandle, useRef } from "react";
import type { UID } from "./astUtils";
import * as babel from "@babel/standalone";
//@ts-expect-error
import previewPage from "./preview.html?text";

export default function PreviewFrame({
  code,
  onSelect,
  ref,
}: {
  code: string;
  onSelect: (uid: UID) => void;
  ref?: React.Ref<{
    requestComputedStyle: (uid: UID) => Promise<void>;
  }>;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useImperativeHandle(ref, () => ({
    requestComputedStyle: (uid: UID) => {
      return new Promise((resolve) => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const handler = (ev: MessageEvent) => {
          if (ev.data && ev.data.type === "style-data" && ev.data.uid === uid) {
            window.removeEventListener("message", handler);
            resolve(ev.data.styles);
          }
        };

        window.addEventListener("message", handler);
        iframe.contentWindow?.postMessage({ type: "get-style", uid }, "*");
      });
    },
  }));

  const selectedUidRef = useRef<UID | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument!;
    doc.open();

    const parsedCode = babel.transform(code, {
      filename: "file.tsx",
      presets: [["typescript", { isTSX: true, allExtensions: true }], "react"],
    }).code;

    const html = previewPage
      .replace(`"Virtual Module"`, parsedCode)
      .replace(
        "let prevSelectedElementUId = null",
        selectedUidRef.current
          ? `let prevSelectedElementUId = "${selectedUidRef.current}"`
          : "let prevSelectedElementUId = null"
      );

    doc.write(html);
    doc.close();
  }, [code]);

  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      if (!ev.data) return;
      if (ev.data.type === "select") {
        selectedUidRef.current = ev.data.uid;
        onSelect(ev.data.uid);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onSelect]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-none rounded-lg"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
