import { useState } from "react";
import type { ExerciseMedia } from "./schema";

export function reviewedEmbedUrl(media: ExerciseMedia): string | undefined {
  if (
    media.reviewStatus !== "reviewed" ||
    !media.embedAllowed ||
    media.kind !== "video"
  )
    return;
  const url = new URL(media.url);
  let id: string | undefined;
  if (
    ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)
  )
    id =
      url.searchParams.get("v") ??
      (/^\/(embed|shorts)\//.test(url.pathname)
        ? url.pathname.split("/")[2]
        : undefined);
  if (url.hostname === "youtu.be") id = url.pathname.slice(1);
  if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) return;
  const embed = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
  embed.searchParams.set("autoplay", "0");
  embed.searchParams.set("controls", "1");
  if (media.captionsAvailable) embed.searchParams.set("cc_load_policy", "1");
  if (media.startSeconds != null)
    embed.searchParams.set("start", String(media.startSeconds));
  if (media.endSeconds != null)
    embed.searchParams.set("end", String(media.endSeconds));
  return embed.href;
}
export function ReviewedMediaPlayer({
  media,
  exerciseName,
}: {
  media: ExerciseMedia;
  exerciseName: string;
}) {
  const [loaded, setLoaded] = useState(false),
    [failed, setFailed] = useState(false);
  const embed = reviewedEmbedUrl(media);
  return (
    <figure className="reviewed-media">
      {media.url.startsWith("/media/") && media.reviewStatus === "reviewed" && (
        <img
          src={media.url}
          alt={media.alt ?? ""}
          width="480"
          height="240"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      )}
      {embed && (
        <div className="media-frame">
          {loaded && !failed ? (
            <iframe
              title={`${exerciseName} — demonstration by ${media.credit ?? media.provider}`}
              src={embed}
              allow="encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="media-placeholder">
              <p>
                {failed
                  ? "This demonstration could not load."
                  : "Load the reviewed demonstration when you are ready."}
              </p>
              {!failed && (
                <button
                  className="button primary"
                  onClick={() => setLoaded(true)}
                >
                  Load video
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {loaded && !failed && (
        <button className="button secondary" onClick={() => setFailed(true)}>
          Video unavailable? Use written steps
        </button>
      )}
      {media.reviewStatus !== "reviewed" && (
        <p role="status">
          Demonstration unavailable. Written instructions remain available.
        </p>
      )}
      <figcaption>
        <p>{media.whySelected}</p>
        <p>
          Credit: {media.credit ?? media.provider} ·{" "}
          {media.license ?? "License not provided"} · Reviewed{" "}
          {media.reviewedAt ?? "not yet"}
        </p>
        <p>
          {media.captionsAvailable
            ? "Captions available."
            : "Caption availability not confirmed. Complete written instructions are provided."}
        </p>
        <a href={media.url} target="_blank" rel="noreferrer">
          {embed
            ? "Watch on YouTube"
            : media.url.startsWith("/media/")
              ? "Open original diagram"
              : "Open external demonstration"}
        </a>
        {!media.url.startsWith("/media/") && (
          <p className="muted">
            Loading or opening this media contacts {media.provider}. If playback
            is restricted or blocked, use the external link or written steps.
          </p>
        )}
      </figcaption>
    </figure>
  );
}
