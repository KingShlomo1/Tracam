import type { TabId } from "../types";
import Icon, { type IconName } from "./Icon";

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; icon: IconName; label: string; camera?: boolean }[] = [
  { id: "map", icon: "map", label: "Map" },
  { id: "gallery", icon: "grid", label: "Gallery" },
  { id: "camera", icon: "camera", label: "Snap", camera: true },
  { id: "tips", icon: "bulb", label: "Tips" },
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
          <span className="ico">
            <Icon name={t.icon} size={t.camera ? 26 : 23} />
          </span>
          {!t.camera && <span>{t.label}</span>}
        </button>
      ))}
    </nav>
  );
}
