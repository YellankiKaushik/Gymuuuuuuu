import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useId,
  isValidElement,
  cloneElement,
  type ReactNode,
} from "react";
import { PageHeader, SectionNav } from "../../components/common/page-header";
import { readRecoveryView, type RecoveryView } from "./storage";
type Workspace = {
  view: RecoveryView | null;
  error: string;
  message: string;
  busy: boolean;
  run: (work: () => Promise<unknown>, message: string) => Promise<boolean>;
  reload: () => Promise<void>;
};
const Context = createContext<Workspace | null>(null);
export function RecoveryPage({
  title,
  children,
  publicKnowledge = false,
}: {
  title: string;
  children: ReactNode;
  publicKnowledge?: boolean;
}) {
  const [view, setView] = useState<RecoveryView | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const reload = useCallback(
    () =>
      readRecoveryView(90)
        .then(setView)
        .catch(() =>
          setError(
            "Recovery storage is unavailable. Your unsaved values remain on this page.",
          ),
        ),
    [],
  );
  useEffect(() => {
    if (publicKnowledge) return;
    void reload();
    const update = () => void reload();
    window.addEventListener("fitness-os:recovery-changed", update);
    const channel =
      "BroadcastChannel" in window
        ? new BroadcastChannel("fitness-os-recovery")
        : null;
    if (channel) channel.onmessage = update;
    return () => {
      window.removeEventListener("fitness-os:recovery-changed", update);
      channel?.close();
    };
  }, [reload, publicKnowledge]);
  const run = async (work: () => Promise<unknown>, success: string) => {
    if (pending.current) return false;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await work();
      await reload();
      setMessage(success);
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Save failed; existing records were preserved.",
      );
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  return (
    <Context.Provider value={{ view, error, message, busy, run, reload }}>
      <div className="page recovery-page">
        <PageHeader
          eyebrow={
            publicKnowledge ? "Recovery knowledge" : "Recovery · device local"
          }
          title={title}
          description={
            publicKnowledge
              ? "Source-backed education and routines, with population limits and review levels shown."
              : "Optional diary and routines. Your reports stay in this browser; no recovery score or training prescription is generated."
          }
        />
        <SectionNav
          label="Recovery tools"
          items={[
            { label: "Overview", href: "/recovery" },
            { label: "Check-in", href: "/recovery/check-in" },
            { label: "Sleep", href: "/sleep" },
            { label: "Sleep diary", href: "/sleep/log" },
            { label: "Mobility", href: "/mobility" },
            { label: "My routines", href: "/mobility/custom" },
            { label: "Warm-ups", href: "/warm-ups" },
            { label: "Backup & settings", href: "/recovery/settings" },
          ]}
        />
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        {view?.quarantined ? (
          <p role="alert">
            {view.quarantined} unreadable records are excluded from this view.
            Export raw recovery in settings before attempting repair. Healthy
            records remain visible.
          </p>
        ) : null}
        {view?.data.settings[0]?.value.trackingEnabled === false && (
          <p role="status">
            Optional tracking is disabled. Existing records remain available.
            Enable tracking in settings before saving new personal records.
          </p>
        )}
        {publicKnowledge ? (
          children
        ) : !view ? (
          <p role="status">Loading browser records…</p>
        ) : (
          children
        )}
      </div>
    </Context.Provider>
  );
}
export function useRecovery() {
  const context = useContext(Context);
  if (!context) throw Error("Recovery workspace missing.");
  return context;
}
export function Field({
  label,
  children,
  help,
}: {
  label: string;
  children: ReactNode;
  help?: string;
}) {
  const controlId = useId();
  const control = isValidElement<{ id?: string; "aria-describedby"?: string }>(
    children,
  )
    ? cloneElement(children, {
        id: controlId,
        "aria-describedby": help
          ? `${controlId}-help`
          : children.props["aria-describedby"],
      })
    : children;
  return (
    <div className="recovery-field">
      <label htmlFor={controlId}>{label}</label>
      {control}
      {help && <small id={`${controlId}-help`}>{help}</small>}
    </div>
  );
}
export function display(value: number | null | undefined, decimals = 1) {
  return value == null
    ? "Not measured"
    : Number(value.toFixed(decimals)).toString();
}
export function downloadRecoveryFile(
  text: string,
  name: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
