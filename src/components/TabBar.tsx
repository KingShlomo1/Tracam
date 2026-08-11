import type { TabId } from "../types";

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; icon: string; label: string; camera?: boolean }[] = [
  { id: "map", icon: "🗺️", label: "Map" },
  { id: "gallery", icon: "🖼️", label: "Gallery" },
  { id: "camera", icon: "📷", label: "Snap", camera: true },
  { id: "tips", icon: "💡", label: "Tips" },
];

export default function TabBar({ active, onChange }: Props) {
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={
            "tab" +
            (t.camera ? " camera-tab" : "") +
            (active === t.id ? " active" : "")
          }
          onClick={() => onChange(t.id)}
          aria-label={t.label}
        >
          <span className="ico">{t.icon}</span>
          {!t.camera && <span>{t.label}</span>}
        </button>
      ))}
    </nav>
  );
}
