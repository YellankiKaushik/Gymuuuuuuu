import { useEffect, useRef, useState } from "react";
import {
  claimWorkout,
  getWorkoutEditorId,
  getWorkout,
  saveWorkout,
} from "./storage";
import type { WorkoutSession } from "./schema";
export function useWorkoutEditor(id: string) {
  const [session, setSession] = useState<WorkoutSession>(),
    [message, setMessage] = useState("Loading local workout…"),
    [owned, setOwned] = useState(false),
    [busy, setBusy] = useState(false);
  const draft = useRef<WorkoutSession | undefined>(undefined),
    revision = useRef(0),
    queue = useRef(Promise.resolve()),
    pending = useRef(0);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    waiters = useRef<
      { resolve: () => void; reject: (reason: unknown) => void }[]
    >([]);
  useEffect(() => {
    let cancelled = false;
    void getWorkout(id)
      .then(async (value) => {
        if (cancelled) return;
        if (!value) {
          setMessage("This workout was not found.");
          return;
        }
        draft.current = value;
        revision.current = value.revision;
        setSession(value);
        const accepted = await claimWorkout(id, getWorkoutEditorId());
        if (!cancelled) {
          setOwned(accepted);
          setMessage(
            accepted
              ? "Saved"
              : "Another tab owns this workout. You can view it or explicitly take over.",
          );
        }
      })
      .catch((error: Error) => {
        if (!cancelled) setMessage(error.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);
  useEffect(() => {
    if (!owned) return;
    const timer = setInterval(() => {
      void claimWorkout(id, getWorkoutEditorId())
        .then((accepted) => {
          if (!accepted) {
            setOwned(false);
            setMessage(
              "Another tab took over. Your draft remains available for export.",
            );
          }
        })
        .catch((error: Error) => setMessage(error.message));
    }, 5000);
    return () => clearInterval(timer);
  }, [id, owned]);
  useEffect(() => {
    if (!busy) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);
  const mutate = (change: (current: WorkoutSession) => WorkoutSession) => {
    if (!owned || !draft.current)
      return Promise.reject(
        new Error("Take over this workout before editing."),
      );
    const next = {
      ...change(draft.current),
      updatedAt: new Date().toISOString(),
    };
    draft.current = next;
    setSession(next);
    setMessage("Saving…");
    setBusy(true);
    pending.current++;
    const completion = new Promise<void>((resolve, reject) =>
      waiters.current.push({ resolve, reject }),
    );
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      const snapshot = draft.current!,
        batch = waiters.current;
      waiters.current = [];
      debounce.current = undefined;
      const save = queue.current.then(async () => {
        const result = await saveWorkout(
          snapshot,
          revision.current,
          getWorkoutEditorId(),
        );
        revision.current = result.revision;
        if (draft.current === snapshot) {
          draft.current = result;
          setSession(result);
        }
        if (pending.current === batch.length) setMessage("Saved");
      });
      queue.current = save
        .then(
          () => {
            batch.forEach((waiter) => waiter.resolve());
          },
          (error: Error) => {
            setMessage(error.message);
            batch.forEach((waiter) => waiter.reject(error));
          },
        )
        .finally(() => {
          pending.current -= batch.length;
          if (!pending.current) setBusy(false);
        });
    }, 120);
    return completion;
  };
  const takeover = async () => {
    if (pending.current)
      throw new Error(
        "Wait for pending saves to finish or fail before taking over. Export your unsaved draft if needed.",
      );
    if (await claimWorkout(id, getWorkoutEditorId(), true)) {
      const latest = await getWorkout(id);
      if (latest) {
        draft.current = latest;
        revision.current = latest.revision;
        setSession(latest);
        setOwned(true);
        setMessage("Editor taken over. Latest saved revision loaded.");
      }
    }
  };
  return {
    session,
    message,
    owned,
    busy,
    mutate,
    takeover,
    retry: () => mutate((current) => current),
  };
}
