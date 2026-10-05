import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { PageHeader, SectionNav } from "../../components/common/page-header";
import { CardioField } from "../cardio/workspace";
import { readView, type View } from "./storage";
export { CardioField as Field } from "../cardio/workspace";
export { numberOrNull, readable } from "../cardio/workspace";
void CardioField;
type Workspace = {
  view: View | null;
  busy: boolean;
  run: (action: () => Promise<unknown>, message: string) => Promise<boolean>;
  reload: (offset?: number) => Promise<void>;
};
const Context = createContext<Workspace | null>(null);
const subscribe = () => () => {},
  client = () => true,
  server = () => false;
export function Frame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const hydrated = useSyncExternalStore(subscribe, client, server);
  return (
    <div className="page supplements-page">
      <PageHeader
        title={title}
        eyebrow="Supplement evidence & personal records"
        description="Claim-specific evidence and optional records kept in this browser."
      />
      <SectionNav
        label="Supplement tools"
        items={[
          { label: "Overview", href: "/supplements" },
          { label: "Ingredients", href: "/supplements/ingredients" },
          { label: "Evidence", href: "/supplements/evidence" },
          { label: "Compare", href: "/supplements/compare" },
          { label: "My products", href: "/supplements/products" },
          { label: "My trials", href: "/supplements/trials" },
          { label: "Adverse events", href: "/supplements/adverse-events" },
          { label: "Safety", href: "/supplements/safety" },
          { label: "Quality", href: "/supplements/quality" },
          { label: "Anti-doping", href: "/supplements/anti-doping" },
          { label: "Frameworks", href: "/supplements/frameworks" },
          { label: "Backup & settings", href: "/supplements/settings" },
        ]}
      />
      <fieldset className="cardio-ready" disabled={!hydrated}>
        <legend className="sr-only">Supplement workspace</legend>
        {children}
      </fieldset>
      <p>
        <a href="/supplements/methodology">Methods & sources</a> ·{" "}
        <a href="/supplements/privacy">Local privacy</a>
      </p>
    </div>
  );
}
export function WorkspacePage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [view, setView] = useState<View | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const pending = useRef(false);
  const reload = useCallback(
    (offset = 0) =>
      readView(offset)
        .then(setView)
        .catch(() =>
          setError(
            "Storage is unavailable. Unsaved values remain here; raw recovery is available in settings.",
          ),
        ),
    [],
  );
  useEffect(() => {
    void reload();
    const channel =
      "BroadcastChannel" in window
        ? new BroadcastChannel("fitness-os-supplement-changes")
        : null;
    if (channel) channel.onmessage = () => void reload();
    return () => channel?.close();
  }, [reload]);
  const run = async (action: () => Promise<unknown>, success: string) => {
    if (pending.current) return false;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
      await reload(view?.offset ?? 0);
      setMessage(success);
      return true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Save failed; existing records remain",
      );
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  return (
    <Context.Provider value={{ view, busy, run, reload }}>
      <Frame title={title}>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {message && <p role="status">{message}</p>}
        {!view && <p role="status">Loading browser records…</p>}
        {view?.quarantined ? (
          <p role="status">
            {view.quarantined} unsupported records isolated. Healthy records
            remain visible; export raw recovery before repair.
          </p>
        ) : null}
        {view?.data.settings[0]?.value.trackingEnabled === false && (
          <p role="status">
            Tracking disabled. Existing records and exports remain available.
          </p>
        )}
        {children}
      </Frame>
    </Context.Provider>
  );
}
export function useWorkspace() {
  const value = useContext(Context);
  if (!value) throw Error("Supplement workspace missing");
  return value;
}
export function TextField({
  label,
  value,
  onChange,
  type = "text",
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  help?: string;
}) {
  return (
    <CardioField label={label} help={help}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </CardioField>
  );
}
