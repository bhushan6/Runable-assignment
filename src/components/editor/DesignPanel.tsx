import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectItem,
} from "../ui/select";
import { AlignCenter, AlignLeft, AlignRight, Eye } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "@radix-ui/react-select";
import { SketchPicker } from "react-color";
import type { UID } from "./astUtils";

export default function DesignPanel({
  selectedUid,
  onUpdate,
  getNodePreview,
}: {
  selectedUid: UID | null;
  onUpdate: (u: UID, upd: any) => void;
  getNodePreview: (u: UID) => Promise<{ text: string; style: any } | null>;
}) {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState("16");
  const [fontWeight, setFontWeight] = useState("normal");
  const [textAlign, setTextAlign] = useState("left");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  useEffect(() => {
    if (!selectedUid) return;
    (async () => {
      const preview = await getNodePreview(selectedUid);
      if (!preview) return;

      setText(preview.text || "");
      const style = preview.style || {};
      setColor(style.color || "#000000");
      setBackgroundColor(
        style.background || style.backgroundColor || "#ffffff"
      );
      setFontSize(
        style.fontSize
          ? String(
              Number.parseInt(String(style.fontSize).replace("px", "")) || 16
            )
          : "16"
      );
      setFontWeight(style.fontWeight || "normal");
      setTextAlign(style.textAlign || "left");
    })();
  }, [selectedUid]);

  if (!selectedUid) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Select an element in the preview to edit it</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Typography</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="text">Text Content</Label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                onUpdate(selectedUid, { text: e.target.value });
              }}
              className="w-full mt-1 min-h-[80px] p-2 border rounded-md resize-none"
              placeholder="Enter text content..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="fontSize">Size</Label>
              <Select
                value={fontSize}
                onValueChange={(value) => {
                  setFontSize(value);
                  onUpdate(selectedUid, { style: { fontSize: `${value}px` } });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12px</SelectItem>
                  <SelectItem value="14">14px</SelectItem>
                  <SelectItem value="16">16px</SelectItem>
                  <SelectItem value="18">18px</SelectItem>
                  <SelectItem value="20">20px</SelectItem>
                  <SelectItem value="24">24px</SelectItem>
                  <SelectItem value="28">28px</SelectItem>
                  <SelectItem value="32">32px</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fontWeight">Weight</Label>
              <Select
                value={fontWeight}
                onValueChange={(value) => {
                  setFontWeight(value);
                  onUpdate(selectedUid, { style: { fontWeight: value } });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="500">Medium</SelectItem>
                  <SelectItem value="600">Semibold</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Alignment</Label>
            <div className="flex gap-1 mt-1">
              {[
                { value: "left", icon: AlignLeft },
                { value: "center", icon: AlignCenter },
                { value: "right", icon: AlignRight },
              ].map(({ value, icon: Icon }) => (
                <Button
                  key={value}
                  variant={textAlign === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setTextAlign(value);
                    onUpdate(selectedUid, { style: { textAlign: value } });
                  }}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Color</h3>

        <div className="space-y-4">
          <div>
            <Label>Text Color</Label>
            <div className="relative mt-1">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => setShowColorPicker(!showColorPicker)}
              >
                <div
                  className="w-4 h-4 rounded mr-2 border"
                  style={{ backgroundColor: color }}
                />
                {color}
              </Button>
              {showColorPicker && (
                <div className="absolute bottom-0 left-0 z-10 mt-1">
                  <div
                    className="fixed inset-0"
                    onClick={() => setShowColorPicker(false)}
                  />
                  <SketchPicker
                    color={color}
                    onChangeComplete={(c) => {
                      setColor(c.hex);
                      onUpdate(selectedUid, { style: { color: c.hex } });
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>Background</Label>
            <div className="relative mt-1">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => setShowBgColorPicker(!showBgColorPicker)}
              >
                <div
                  className="w-4 h-4 rounded mr-2 border"
                  style={{ backgroundColor: backgroundColor }}
                />
                {backgroundColor}
              </Button>
              {showBgColorPicker && (
                <div className="absolute bottom-0 left-0 z-10 mt-1">
                  <div
                    className="fixed inset-0"
                    onClick={() => setShowBgColorPicker(false)}
                  />
                  <SketchPicker
                    color={backgroundColor}
                    onChangeComplete={(c) => {
                      setBackgroundColor(c.hex);
                      onUpdate(selectedUid, {
                        style: { backgroundColor: c.hex },
                      });
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
