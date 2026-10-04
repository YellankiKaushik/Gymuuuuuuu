import { useEffect, useState } from "react";
const key = "fitness-os:active-workout:v1";
export function publishWorkoutPointer(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(key, id);
    else window.localStorage.removeItem(key);
  } catch {
    /* This convenience pointer is never authoritative. */
  }
  window.dispatchEvent?.(new Event("fitness-os:workout-pointer"));
}
export function WorkoutResume() {
  const [id, setId] = useState<string>();
  useEffect(() => {
    const update = () => {
      try {
        const value = window.localStorage.getItem(key);
        setId(value && /^workout_[a-z0-9_-]+$/.test(value) ? value : undefined);
      } catch {
        setId(undefined);
      }
    };
    queueMicrotask(update);
    window.addEventListener("storage", update);
    window.addEventListener("fitness-os:workout-pointer", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("fitness-os:workout-pointer", update);
    };
  }, []);
  return id ? (
    <a className="resume-workout" href={`/workout/session/${id}`}>
      Resume workout
    </a>
  ) : null;
}
