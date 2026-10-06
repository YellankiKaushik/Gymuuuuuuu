import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useId,
  isValidElement,
  cloneElement,
  type ReactNode,
} from "react";
import { PageHeader, SectionNav } from "../../components/common/page-header";
import { readCardioView, type CardioView } from "./storage";
type Workspace = {
  view: CardioView | null;
  busy: boolean;
  run: (action: () => Promise<unknown>, success: string) => Promise<boolean>;
  reload: () => Promise<void>;
};
const Context = createContext<Workspace | null>(null);
export function CardioPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [view, setView] = useState<CardioView | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const reload = useCallback(
    () =>
      readCardioView()
        .then(setView)
        .catch(() =>
          setError(
            "Cardio storage is unavailable. Unsaved form values remain on this page; export raw data in settings if repair is needed.",
          ),
        ),
    [],
  );
  useEffect(() => {
    void reload();
    const channel =
      "BroadcastChannel" in window
        ? new BroadcastChannel("fitness-os-cardio-changes")
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
      await reload();
      setMessage(success);
      return true;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Save failed; existing records were preserved.",
      );
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };
  return (
    <Context.Provider value={{ view, busy, run, reload }}>
      <CardioFrame title={title}>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {message && <p role="status">{message}</p>}
        {!view && <p role="status">Loading browser records…</p>}
        {view?.quarantined ? (
          <p role="status">
            {view.quarantined} invalid or unsupported records were isolated.
            Export raw data before repair; healthy records remain visible.
          </p>
        ) : null}
        {view?.preferences.value.trackingEnabled === false && (
          <p role="status">
            Tracking is disabled. Existing records and exports remain available.
          </p>
        )}
        {children}
      </CardioFrame>
    </Context.Provider>
  );
}
export function CardioFrame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    clientHydration,
    serverHydration,
  );
  return (
    <div className="page cardio-page">
      <PageHeader
        eyebrow="Cardio & conditioning"
        title={title}
        description="Method-labelled tools and optional records saved in this browser. Choose your own activity; no automatic training prescription."
      />
      <SectionNav
        label="Cardio tools"
        items={[
          { label: "Overview", href: "/cardio" },
          { label: "Learn", href: "/cardio/learn" },
          { label: "Public plans", href: "/cardio/plans" },
          { label: "New session", href: "/cardio/session/new" },
          { label: "Active session", href: "/cardio/session/active" },
          { label: "History", href: "/cardio/history" },
          { label: "My plans", href: "/cardio/custom-plans" },
          { label: "Conditioning", href: "/conditioning" },
          { label: "Pace", href: "/cardio/calculators/pace" },
          { label: "Intensity", href: "/cardio/calculators/intensity" },
          { label: "Settings & backup", href: "/cardio/settings" },
        ]}
      />
      <fieldset className="cardio-ready" disabled={!hydrated}>
        <legend className="sr-only">Cardio workspace</legend>
        {children}
      </fieldset>
      <p className="muted">
        <a href="/cardio/methodology">Methods & sources</a> ·{" "}
        <a href="/cardio/privacy">Local data & privacy</a>
      </p>
    </div>
  );
}
function subscribeHydration() {
  return () => {};
}
function clientHydration() {
  return true;
}
function serverHydration() {
  return false;
}
export function useCardio() {
  const value = useContext(Context);
  if (!value) throw Error("Cardio workspace is missing.");
  return value;
}
export function CardioField({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: ReactNode;
}) {
  const controlId = useId();
  const child = isValidElement<{ id?: string; "aria-describedby"?: string }>(
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
      {child}
      {help && <small id={`${controlId}-help`}>{help}</small>}
    </div>
  );
}
export function numberOrNull(value: string) {
  if (value.trim() === "") return null;
  const result = Number(value);
  if (!Number.isFinite(result))
    throw Error("Enter a finite number or leave the measurement blank.");
  return result;
}
export const display = (value: number | null | undefined, decimals = 1) =>
  value == null ? "Not measured" : Number(value.toFixed(decimals)).toString();
export const readable = (value: string) => value.replaceAll("_", " ");
