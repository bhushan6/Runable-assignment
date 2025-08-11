import { Label } from "../ui/label";

export default function CodeEditor({
  state,
  lastError,
  onChange,
}: {
  state: any;
  lastError: string | null;
  onChange: (code: string) => void;
}) {
  return (
    <div className="p-4">
      <Label htmlFor="code-editor">Component Code</Label>
      <textarea
        id="code-editor"
        value={state.code}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-96 mt-2 p-3 font-mono text-sm border rounded-md resize-none"
        placeholder="Paste your React component code here..."
      />
      {lastError && (
        <div className="mt-2 p-2 text-sm text-red-600 bg-red-50 rounded">
          Error: {lastError}
        </div>
      )}
    </div>
  );
}
