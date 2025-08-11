"use client";

import { useEffect, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Code2 } from "lucide-react";
import {
  initializeAST,
  updateElement,
  type UID,
} from "./components/editor/astUtils";
import DesignPanel from "./components/editor/DesignPanel";
import CodeEditor from "./components/editor/CodeEditor";
import PreviewFrame from "./components/editor/PreviewFrame";

// forcing dark mode
const root = window.document.documentElement;
root.classList.add("dark");

const defaultCode = `<div style={{ padding: '40px', fontFamily: 'Inter, system-ui', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <div style={{ background: '#1a1a1a', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '100%', color: '#fff' }}>
    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>AcMem</h1>
      <p style={{ color: '#888', fontSize: '16px' }}>Help your LLM remember the right stuff.</p>
    </div>
    <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
      AcMem retains context across sessions, learns from past interactions, and eliminates repetitive prompting. Join our waitlist and be the first to get in.
    </p>
    <div style={{ display: 'flex', gap: '12px' }}>
      <input 
        placeholder="Your work email" 
        style={{ 
          flex: 1, 
          padding: '12px', 
          borderRadius: '8px', 
          border: 'none', 
          background: '#333', 
          color: '#fff',
          fontSize: '14px'
        }} 
      />
      <button style={{ 
        padding: '12px 24px', 
        background: '#fff', 
        color: '#000', 
        border: 'none', 
        borderRadius: '8px', 
        fontWeight: '500',
        fontSize: '14px',
        cursor: 'pointer'
      }}>
        Join waitlist
      </button>
    </div>
  </div>
</div>`;

export default function App() {
  const [state, setState] = useState(() => initializeAST(defaultCode));
  const [selected, setSelected] = useState<UID | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("design");

  const previewRef = useRef<{
    requestComputedStyle: (uid: UID) => Promise<void>;
  }>(null);

  function handleCodeChange(newCode: string) {
    try {
      const next = initializeAST(newCode);
      setState(next);
      setSelected(null);
      setLastError(null);
    } catch (err: any) {
      setLastError(String(err));
    }
  }

  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  function handleUpdate(uid: UID, updates: any) {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    timeoutId.current = setTimeout(() => {
      const nextState = updateElement(state, uid, updates);
      setState(nextState);
      setSelected(uid);
      setLastError(null);
    }, 300);
  }

  const getNodePreview = async (uid: UID) => {
    const node = state.uidMap.get(uid);
    if (!node) return null;

    const childText =
      (node.children && node.children.length && node.children[0].value) || "";

    const styleObj: any = await previewRef.current?.requestComputedStyle(uid);

    console.log(styleObj, "styleObj");

    return { text: childText, style: styleObj };
  };

  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      if (!ev.data) return;
      if (ev.data.type === "select") {
        setSelected(ev.data.uid);
      }
      if (ev.data.type === "error") setLastError(String(ev.data.message));
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Left Sidebar */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b  h-[70px]">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="design"
                className="dark:data-[state=active]:bg-[--muted]"
              >
                Design
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className="dark:data-[state=active]:bg-[--muted]"
              >
                <Code2 className="w-4 h-4 mr-1" />
                Code
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1">
          {activeTab === "design" ? (
            <DesignPanel
              selectedUid={selected}
              onUpdate={handleUpdate}
              getNodePreview={getNodePreview}
            />
          ) : (
            <CodeEditor
              state={state}
              onChange={handleCodeChange}
              lastError={lastError}
            />
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col text-foreground">
        <div className="p-4 border-b bg-card h-[70px]">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Visual Editor</h1>
          </div>
        </div>

        <div className="flex-1 p-4">
          <Card className="h-full overflow-hidden">
            <PreviewFrame
              ref={previewRef}
              code={state.code}
              onSelect={(uid) => {
                setSelected(uid);
                setActiveTab("design");
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
