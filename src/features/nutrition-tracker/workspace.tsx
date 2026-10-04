import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { readNutritionBackup, exportRawNutritionRecovery } from "./storage";
import { localDateAt } from "./domain";
import type { NutritionBackup } from "./schema";
type Workspace = {
  data: NutritionBackup | null;
  date: string;
  zone: string;
  error: string;
  message: string;
  run: (
    work: () => Promise<NutritionBackup | void>,
    message: string,
  ) => Promise<boolean>;
  reload: () => Promise<void>;
};
const Context = createContext<Workspace | null>(null);
export function NutritionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<NutritionBackup | null>(null),
    [date, setDate] = useState(""),
    [zone, setZone] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const reload = useCallback(
    () =>
      readNutritionBackup()
        .then((backup) => {
          const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          setZone(zone);
          setDate(localDateAt(new Date(), zone));
          setData(backup);
          setError("");
        })
        .catch((error) => {
          setError(
            error instanceof Error
              ? error.message
              : "Nutrition storage unavailable.",
          );
        }),
    [],
  );
  useEffect(() => {
    void reload();
    const update = () => void reload();
    window.addEventListener("fitness-os:nutrition-changed", update);
    const channel =
      "BroadcastChannel" in window
        ? new BroadcastChannel("fitness-os:nutrition-changes")
        : null;
    if (channel) channel.onmessage = update;
    return () => {
      window.removeEventListener("fitness-os:nutrition-changed", update);
      channel?.close();
    };
  }, [reload]);
  const run = async (
    work: () => Promise<NutritionBackup | void>,
    success: string,
  ) => {
    try {
      const saved = await work();
      if (saved) setData(saved);
      else await reload();
      setMessage(success);
      setError("");
      return true;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Save failed. Existing records are preserved.",
      );
      return false;
    }
  };
  return (
    <Context.Provider value={{ data, date, zone, error, message, run, reload }}>
      {error && (
        <div className="notice">
          <p role="alert">{error}</p>
          {!data && (
            <button
              className="button secondary"
              onClick={() =>
                void exportRawNutritionRecovery()
                  .then((text) => {
                    const url = URL.createObjectURL(
                        new Blob([text], { type: "application/json" }),
                      ),
                      anchor = document.createElement("a");
                    anchor.href = url;
                    anchor.download = "nutrition-raw-recovery.json";
                    anchor.click();
                    URL.revokeObjectURL(url);
                    setMessage(
                      "Raw recovery file exported. It must be repaired and validated before restore.",
                    );
                  })
                  .catch((error) =>
                    setError(
                      error instanceof Error
                        ? error.message
                        : "Recovery export failed.",
                    ),
                  )
              }
            >
              Export raw nutrition recovery
            </button>
          )}
        </div>
      )}
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {children}
    </Context.Provider>
  );
}
export function useNutrition() {
  const value = useContext(Context);
  if (!value) throw Error("Nutrition workspace missing.");
  return value;
}
