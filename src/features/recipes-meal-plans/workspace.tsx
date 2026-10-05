import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import {
  readRecipeBackup,
  readRawRecipeData,
  isolateRecipeRecords,
} from "./storage";
import type { RecipeBackup } from "./schema";
type Workspace = {
  data: RecipeBackup | null;
  readOnly: boolean;
  message: string;
  error: string;
  run: (
    work: () => Promise<RecipeBackup | void>,
    success: string,
    recovery?: boolean,
  ) => Promise<boolean>;
};
const Context = createContext<Workspace | null>(null);
export function RecipeWorkspace({ children }: { children: ReactNode }) {
  const pending = useRef(false);
  const [data, setData] = useState<RecipeBackup | null>(null),
    [readOnly, setReadOnly] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const reload = useCallback(
    () =>
      readRecipeBackup()
        .then((backup) => {
          setData(backup);
          setReadOnly(false);
          setError("");
        })
        .catch(async (cause: unknown) => {
          setError(
            cause instanceof Error
              ? cause.message
              : "Recipe storage unavailable.",
          );
          try {
            const isolated = isolateRecipeRecords(await readRawRecipeData());
            setData(isolated.backup);
            setReadOnly(true);
          } catch {
            setReadOnly(true);
          }
        }),
    [],
  );
  useEffect(() => {
    void reload();
    const update = () => {
      void reload();
    };
    window.addEventListener("fitness-os:recipes-changed", update);
    const channel =
      "BroadcastChannel" in window
        ? new BroadcastChannel("fitness-os:recipe-changes")
        : null;
    if (channel) channel.onmessage = update;
    return () => {
      window.removeEventListener("fitness-os:recipes-changed", update);
      channel?.close();
    };
  }, [reload]);
  const run: Workspace["run"] = async (work, success, recovery = false) => {
    if (pending.current) return false;
    pending.current = true;
    setMessage("");
    try {
      if (readOnly && !recovery)
        throw Error(
          "Storage is read-only. Export recovery data, then restore a validated backup in Settings.",
        );
      const saved = await work();
      if (saved) {
        setData(saved);
        setReadOnly(false);
      } else await reload();
      setMessage(success);
      setError("");
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Save failed. Existing data is preserved.",
      );
      return false;
    } finally {
      pending.current = false;
    }
  };
  return (
    <Context.Provider value={{ data, readOnly, message, error, run }}>
      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
      {readOnly && (
        <p className="notice">
          Healthy records are available for reading. Changes are disabled until
          recovery. <a href="/meal-plans/settings">Open backup and recovery</a>
        </p>
      )}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {children}
    </Context.Provider>
  );
}
export function useRecipes() {
  const value = useContext(Context);
  if (!value) throw Error("Recipe workspace missing");
  return value;
}
export function downloadRecipeFile(
  text: string,
  filename: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([text], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
