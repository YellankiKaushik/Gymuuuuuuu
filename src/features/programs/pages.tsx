import { useEffect, useState } from "react";
import { usePreferences } from "../../components/app-shell/preferences";
import { PageHeader } from "../../components/common/page-header";
import { EmptyState, NotFoundState } from "../../components/common/states";
import { InfoCallout } from "../../components/common/primitives";
import { createRecordStorage } from "../../storage/indexed-db/adapter";
import { exerciseIndexes, exerciseTaxonomy } from "../exercises/repository";
import { scienceIndexes } from "../workout-science/repository";
import {
  deriveProgramSummary,
  getProgramBySlug,
  programIndexes,
  programTaxonomy,
  resolveProgramVersion,
} from "./repository";
import {
  findPrograms,
  parseProgramQuery,
  programFilters,
  searchPrograms,
  type FinderInput,
  type ProgramQuery,
} from "./query";
import {
  clearCurrentProgram,
  listProgramInstances,
  selectProgram,
  updateProgramInstance,
} from "./local";
import {
  programExperiences,
  programGoals,
  programStyles,
  weekdays,
  type LocalProgramInstance,
  type Program,
} from "./schema";
const words = (value: string) =>
  value.replaceAll("-", " ").replaceAll("_", " ");
const range = (value: { min: number; max: number } | null | undefined) =>
  value
    ? value.min === value.max
      ? String(value.min)
      : `${value.min}–${value.max}`
    : "Not available";
function ProgramNav() {
  return (
    <nav className="section-nav" aria-label="Programs">
      <a href="/programs">Browse</a>
      <a href="/programs/finder">Find a program</a>
      <a href="/programs/compare">Compare</a>
      <a href="/programs/current">My program</a>
    </nav>
  );
}
function Card({ program }: { program: Program }) {
  return (
    <a className="entity-card" href={`/programs/${program.slug}`}>
      <small>{words(program.primaryGoal)}</small>
      <h2>{program.displayName}</h2>
      <p>{program.summary}</p>
      <div className="tag-row">
        <span>{program.trainingDaysPerWeek} days / week</span>
        <span>{range(program.sessionDurationMinutes)} min / session</span>
        <span>{words(program.routineStyle)}</span>
      </div>
    </a>
  );
}
export function ProgramCatalogue({
  query,
  change,
}: {
  query: ProgramQuery;
  change: (next: ProgramQuery) => void;
}) {
  const { hydrated } = usePreferences();
  const results = searchPrograms(query);
  return (
    <div className="page">
      <PageHeader
        title="Workout programs"
        eyebrow="TRAIN / PROGRAMS"
        description="Compare reviewed templates by your goals, time and equipment."
      />
      <ProgramNav />
      <div className="catalogue-toolbar">
        <input
          className="search-field"
          aria-label="Search programs"
          disabled={!hydrated}
          value={query.q}
          placeholder="Search programs…"
          onChange={(event) => change({ ...query, q: event.target.value })}
        />
        <label>
          Sort
          <select
            value={query.sort}
            onChange={(event) => change({ ...query, sort: event.target.value })}
          >
            {[
              "editorial",
              "az",
              "days-asc",
              "days-desc",
              "short",
              "reviewed",
            ].map((value) => (
              <option key={value} value={value}>
                {words(value)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="exercise-filter-fields">
        {Object.entries(programFilters).map(([key, options]) => (
          <details key={key}>
            <summary>{words(key)}</summary>
            <fieldset>
              <legend className="sr-only">{words(key)}</legend>
              {options.map((id) => (
                <label key={id}>
                  <input
                    type="checkbox"
                    checked={query[key as keyof typeof programFilters].includes(
                      id,
                    )}
                    onChange={(event) =>
                      change({
                        ...query,
                        [key]: event.target.checked
                          ? [...query[key as keyof typeof programFilters], id]
                          : query[key as keyof typeof programFilters].filter(
                              (item) => item !== id,
                            ),
                      })
                    }
                  />
                  {programTaxonomy.equipmentProfiles.find(
                    (item) => item.id === id,
                  )?.displayName ?? words(id)}
                </label>
              ))}
            </fieldset>
          </details>
        ))}
      </div>
      <button
        className="text-button"
        onClick={() => change(parseProgramQuery({}))}
      >
        Clear program filters
      </button>
      <p role="status">{results.length} reviewed programs</p>
      {results.length ? (
        <div className="entity-grid">
          {results.map((program) => (
            <div key={program.id}>
              <Card program={program} />
              <label>
                <input
                  type="checkbox"
                  checked={query.compare.includes(program.id)}
                  disabled={
                    !query.compare.includes(program.id) &&
                    query.compare.length === 3
                  }
                  onChange={(event) =>
                    change({
                      ...query,
                      compare: event.target.checked
                        ? [...query.compare, program.id]
                        : query.compare.filter((id) => id !== program.id),
                    })
                  }
                />
                Compare {program.displayName}
              </label>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No reviewed programs available."
          description="Draft templates stay hidden until their schedule, progression, exercise references and safety pass review."
        />
      )}
      {query.compare.length > 0 && (
        <a
          className="button primary"
          href={`/programs/compare?compare=${query.compare.join(",")}`}
        >
          Compare selected ({query.compare.length}/3)
        </a>
      )}
    </div>
  );
}
export function ProgramFinder() {
  const { hydrated } = usePreferences();
  const [input, setInput] = useState<FinderInput>({
      goal: "general-fitness",
      experience: "beginner",
      days: 3,
      minutes: 60,
      equipmentIds: [],
      environment: "gym",
      style: "",
      eligible: "unsure",
    }),
    [submitted, setSubmitted] = useState(false);
  const results = submitted ? findPrograms(input) : [];
  return (
    <div className="page">
      <PageHeader
        title="Find a program"
        description="Match reviewed templates to practical constraints. Your answers stay on this page until you select a program."
      />
      <ProgramNav />
      <form
        className="local-form"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <label>
          Goal
          <select
            value={input.goal}
            onChange={(event) =>
              setInput({ ...input, goal: event.target.value })
            }
          >
            {programGoals.map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <label>
          Experience
          <select
            value={input.experience}
            onChange={(event) =>
              setInput({ ...input, experience: event.target.value })
            }
          >
            {programExperiences.map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <label>
          Available days per week
          <input
            type="number"
            min="1"
            max="7"
            value={input.days}
            onChange={(event) =>
              setInput({ ...input, days: event.target.valueAsNumber })
            }
            required
          />
        </label>
        <label>
          Minutes available per session
          <input
            type="number"
            min="1"
            max="360"
            value={input.minutes}
            onChange={(event) =>
              setInput({ ...input, minutes: event.target.valueAsNumber })
            }
            required
          />
        </label>
        <label>
          Environment
          <select
            value={input.environment}
            onChange={(event) =>
              setInput({ ...input, environment: event.target.value })
            }
          >
            {[
              "gym",
              "home",
              "outdoors",
              "travel",
              "limited-space",
              "mixed",
            ].map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <label>
          Preferred style
          <select
            value={input.style}
            onChange={(event) =>
              setInput({ ...input, style: event.target.value })
            }
          >
            <option value="">No preference</option>
            {programStyles.map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>Available equipment</legend>
          {exerciseTaxonomy.equipment.map((item) => (
            <label key={item.id}>
              <input
                type="checkbox"
                checked={input.equipmentIds.includes(item.id)}
                onChange={(event) =>
                  setInput({
                    ...input,
                    equipmentIds: event.target.checked
                      ? [...input.equipmentIds, item.id]
                      : input.equipmentIds.filter((id) => id !== item.id),
                  })
                }
              />
              {item.displayName}
            </label>
          ))}
        </fieldset>
        <label>
          These templates cover generally healthy adults. Does that scope fit
          you?
          <select
            value={input.eligible}
            onChange={(event) =>
              setInput({
                ...input,
                eligible: event.target.value as FinderInput["eligible"],
              })
            }
          >
            <option value="unsure">I’m unsure</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <button className="button primary" disabled={!hydrated}>
          Find matching templates
        </button>
      </form>
      {submitted &&
        (input.eligible !== "yes" ? (
          <InfoCallout title="Review the scope with a qualified professional">
            The finder cannot assess individual health or rehabilitation needs.
          </InfoCallout>
        ) : results.length ? (
          <div className="entity-grid">
            {results.map(({ program, reasons }) => (
              <div key={program.id}>
                <Card program={program} />
                <ul>
                  {reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No reviewed template fits these constraints."
            description="You can adjust practical preferences. A missing match is not a reason to exceed your available time or equipment."
          />
        ))}
    </div>
  );
}
export function ProgramComparison({ ids }: { ids: string[] }) {
  const programs = ids.slice(0, 3).flatMap((id) => {
    const item = programIndexes.byId.get(id);
    return item?.contentStatus === "published" ? [item] : [];
  });
  return (
    <div className="page">
      <PageHeader
        title="Compare programs"
        description="Compare the commitment, audience and progression of up to three reviewed templates."
      />
      <ProgramNav />
      {programs.length ? (
        <div className="entity-grid">
          {programs.map((program) => (
            <article className="entity-card" key={program.id}>
              <h2>{program.displayName}</h2>
              <dl>
                <dt>Goal</dt>
                <dd>{words(program.primaryGoal)}</dd>
                <dt>Schedule</dt>
                <dd>
                  {program.trainingDaysPerWeek} days / week ·{" "}
                  {range(program.sessionDurationMinutes)} minutes
                </dd>
                <dt>Equipment</dt>
                <dd>
                  {
                    programTaxonomy.equipmentProfiles.find(
                      (item) => item.id === program.equipmentProfileId,
                    )?.displayName
                  }
                </dd>
                <dt>Audience</dt>
                <dd>{program.audience?.bestFor.join(" · ")}</dd>
                <dt>Progression</dt>
                <dd>
                  {program.progressionRules
                    ?.map((item) => item.displayName)
                    .join(" · ")}
                </dd>
                <dt>Limits</dt>
                <dd>
                  {program.outcomesAndLimits?.doesNotGuarantee.join(" · ")}
                </dd>
              </dl>
              <a href={`/programs/${program.slug}`}>Read this template</a>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Choose programs to compare."
          description="Select up to three from the reviewed catalogue."
        >
          <a className="button secondary" href="/programs">
            Browse programs
          </a>
        </EmptyState>
      )}
    </div>
  );
}
function Lines({ title, items }: { title: string; items?: string[] }) {
  return items?.length ? (
    <section className="detail-section">
      <h2>{title}</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  ) : null;
}
export function ProgramContent({
  program,
  instance,
  update,
}: {
  program: Program;
  instance?: LocalProgramInstance;
  update?: (next: LocalProgramInstance) => void;
}) {
  const summary = deriveProgramSummary(program);
  return (
    <>
      <p>{program.summary}</p>
      <div className="tag-row">
        <span>{summary.sessionCount} sessions / week</span>
        <span>{range(summary.estimatedWeeklyMinutes)} minutes / week</span>
        <span>{summary.exerciseCount} exercises</span>
      </div>
      <small>{summary.method}</small>
      <Lines title="Best for" items={program.audience?.bestFor} />
      <Lines
        title="Assumptions and prerequisites"
        items={[
          ...(program.audience?.assumptions ?? []),
          ...(program.audience?.prerequisites ?? []),
        ]}
      />
      <Lines
        title="Not designed for"
        items={program.outcomesAndLimits?.notDesignedFor}
      />
      <Lines
        title="Outcomes and limits"
        items={[
          ...(program.outcomesAndLimits?.designedToSupport ?? []),
          ...(program.outcomesAndLimits?.doesNotGuarantee ?? []),
        ]}
      />
      <section className="detail-section">
        <h2>Schedule and prescriptions</h2>
        {program.scheduleModel?.sessions.map((session) => (
          <article key={session.id} className="entity-card">
            <h3>
              {session.displayName} · {range(session.estimatedDurationMinutes)}{" "}
              min
            </h3>
            {instance && update && (
              <label>
                Preferred weekday
                <select
                  value={instance.preferredWeekdays[session.id] ?? ""}
                  onChange={(event) => {
                    const days = { ...instance.preferredWeekdays };
                    if (event.target.value)
                      days[session.id] = event.target
                        .value as (typeof weekdays)[number];
                    else delete days[session.id];
                    update({ ...instance, preferredWeekdays: days });
                  }}
                >
                  <option value="">Unassigned</option>
                  {weekdays.map((day) => (
                    <option key={day}>{day}</option>
                  ))}
                </select>
              </label>
            )}
            {session.exerciseBlocks.map((block) => (
              <section key={block.id}>
                <h4>{words(block.blockType)}</h4>
                {block.prescriptions.map((item, index) => {
                  const slot = `${session.id}:${block.id}:${index}`,
                    exercise = exerciseIndexes.byId.get(
                      instance?.substitutionSelections[slot] ?? item.exerciseId,
                    ),
                    alternatives = program.substitutionGroups?.find(
                      (group) => group.id === item.substitutionGroupId,
                    );
                  return (
                    <div key={slot} className="prescription">
                      <a href={`/exercises/${exercise?.slug ?? ""}`}>
                        {exercise?.displayName ?? "Exercise unavailable"}
                      </a>
                      <p>
                        {range(item.sets)} sets ·{" "}
                        {range(item.repetitionTarget.range)}{" "}
                        {item.repetitionTarget.type} · rest{" "}
                        {range(item.restSeconds)} seconds
                      </p>
                      <p>
                        {words(item.effortTarget.method)}:{" "}
                        {typeof item.effortTarget.target === "string"
                          ? item.effortTarget.target
                          : range(item.effortTarget.target)}{" "}
                        {item.effortTarget.qualifier}
                      </p>
                      {item.notes?.map((note) => (
                        <p key={note}>{note}</p>
                      ))}
                      {instance && update && alternatives && (
                        <label>
                          Reviewed alternative
                          <select
                            value={instance.substitutionSelections[slot] ?? ""}
                            onChange={(event) => {
                              const selections = {
                                ...instance.substitutionSelections,
                              };
                              if (event.target.value)
                                selections[slot] = event.target.value;
                              else delete selections[slot];
                              update({
                                ...instance,
                                substitutionSelections: selections,
                              });
                            }}
                          >
                            <option value="">Original exercise</option>
                            {alternatives.candidateExerciseIds.map((id) => (
                              <option key={id} value={id}>
                                {exerciseIndexes.byId.get(id)?.displayName ??
                                  id}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </div>
                  );
                })}
              </section>
            ))}
            <Lines title="Session notes" items={session.sessionNotes} />
          </article>
        ))}
      </section>
      <Lines title="Rest days" items={program.scheduleModel?.restDayGuidance} />
      {program.blocks?.map((block) => (
        <Lines
          key={block.id}
          title={`${block.displayName} · weeks ${range(block.weekRange)}`}
          items={[block.purpose, ...block.transitionRules]}
        />
      ))}
      {program.progressionRules?.map((rule) => (
        <Lines
          key={rule.id}
          title={rule.displayName}
          items={[
            ...rule.trigger,
            ...rule.action,
            ...(rule.ceiling ?? []),
            ...(rule.floor ?? []),
            ...rule.stallResponse,
          ]}
        />
      ))}
      {program.substitutionGroups?.map((group) => (
        <Lines
          key={group.id}
          title={group.displayName}
          items={[...group.matchingRules, ...group.disallowedChanges]}
        />
      ))}
      <Lines
        title="Deload and recovery"
        items={[
          ...(program.deloadStrategy?.implementation ?? []),
          ...(program.deloadStrategy?.limitations ?? []),
        ]}
      />
      <section className="detail-section">
        <h2>Science behind this template</h2>
        {program.scienceRationale?.map((item, index) => (
          <div key={index}>
            <p>{item.decision}</p>
            <p>{item.qualifiers.join(" · ")}</p>
            {item.scienceTopicIds.map((id) => {
              const topic = scienceIndexes.byId.get(id);
              return topic ? (
                <a key={id} href={`/learn/workout-science/${topic.slug}`}>
                  {topic.displayName}
                </a>
              ) : null;
            })}
          </div>
        ))}
      </section>
      {program.measurementGuidance?.map((item, index) => (
        <Lines
          key={index}
          title={words(item.metric)}
          items={[item.howToUse, ...item.limitations]}
        />
      ))}
      <Lines
        title="Safety boundaries"
        items={program.safety?.generalBoundaries}
      />
      <Lines title="Stop signals" items={program.safety?.stopSignals} />
      <Lines
        title="When to seek professional review"
        items={program.safety?.professionalReviewTriggers}
      />
      <section className="detail-section">
        <h2>Sources and review</h2>
        <ul>
          {program.sources?.map((source) => (
            <li key={source.id}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.title}
              </a>{" "}
              · {source.year}
            </li>
          ))}
        </ul>
        <p>
          Version {program.version} · Reviewed {program.review?.reviewedAt} ·
          Next review {program.review?.nextReviewDue}
        </p>
      </section>
    </>
  );
}
export function ProgramDetail({ slug }: { slug: string }) {
  const program = getProgramBySlug(slug),
    [message, setMessage] = useState(""),
    [replaceId, setReplaceId] = useState<string>();
  if (!program || program.contentStatus !== "published")
    return <NotFoundState />;
  const select = async (confirmed = false) => {
    const storage = createRecordStorage();
    try {
      const current = (await listProgramInstances(storage)).find((item) =>
        ["planned", "active", "paused"].includes(item.status),
      );
      if (current && !confirmed) {
        setReplaceId(current.instanceId);
        return;
      }
      await selectProgram(storage, program, confirmed ? replaceId : undefined);
      setReplaceId(undefined);
      setMessage("Program selected. Open My program to assign days.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save the program.",
      );
    } finally {
      storage.close();
    }
  };
  return (
    <div className="page">
      <PageHeader title={program.displayName} eyebrow="TRAIN / PROGRAM" />
      <ProgramNav />
      <div className="catalogue-toolbar">
        <button
          className="button primary"
          onClick={() => {
            void select();
          }}
        >
          Select this program
        </button>
        <button className="button secondary" onClick={() => window.print()}>
          Print template
        </button>
        <button
          className="button secondary"
          onClick={() => {
            void navigator.clipboard
              .writeText(window.location.href)
              .then(() => setMessage("Link copied."))
              .catch(() => setMessage("Copy the address from your browser."));
          }}
        >
          Copy link
        </button>
      </div>
      {replaceId && (
        <InfoCallout title="Replace your current program?">
          <p>
            The previous selection will be archived with its original version.
          </p>
          <button
            className="button primary"
            onClick={() => {
              void select(true);
            }}
          >
            Confirm replacement
          </button>
          <button
            className="button secondary"
            onClick={() => setReplaceId(undefined)}
          >
            Cancel
          </button>
        </InfoCallout>
      )}
      <p role="status">{message}</p>
      <ProgramContent program={program} />
      <a
        href="/about/sources"
        onClick={(event) => {
          event.preventDefault();
          setMessage(
            `Correction reference: ${program.id} v${program.version}. Use the project issue tracker once configured.`,
          );
        }}
      >
        Report a content issue
      </a>
    </div>
  );
}
export function CurrentProgram() {
  const [instances, setInstances] = useState<LocalProgramInstance[]>([]),
    [status, setStatus] = useState("Loading your local program…"),
    [confirm, setConfirm] = useState(false);
  const load = async () => {
    const storage = createRecordStorage();
    try {
      setInstances(await listProgramInstances(storage));
      setStatus("");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Local program could not load.",
      );
    } finally {
      storage.close();
    }
  };
  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, []);
  const current = instances.find((item) =>
      ["planned", "active", "paused"].includes(item.status),
    ),
    program = current
      ? resolveProgramVersion(
          current.canonicalProgramId,
          current.canonicalProgramVersion,
        )
      : undefined;
  const update = async (next: LocalProgramInstance) => {
    const storage = createRecordStorage();
    try {
      if (program) await updateProgramInstance(storage, next, program);
      await load();
      setStatus("Preferences saved locally.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Changes were not saved.",
      );
    } finally {
      storage.close();
    }
  };
  return (
    <div className="page">
      <PageHeader
        title="My program"
        description="Your selection and schedule preferences are stored in this browser."
      />
      <ProgramNav />
      <p role="status">{status}</p>
      {current ? (
        program ? (
          <>
            <h2>{program.displayName}</h2>
            <label>
              Start date
              <input
                type="date"
                value={current.startDate ?? ""}
                onChange={(event) => {
                  void update({
                    ...current,
                    startDate: event.target.value || null,
                  });
                }}
              />
            </label>
            <label>
              Program status
              <select
                value={current.status}
                onChange={(event) => {
                  void update({
                    ...current,
                    status: event.target
                      .value as LocalProgramInstance["status"],
                  });
                }}
              >
                {["planned", "active", "paused", "completed"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            {programIndexes.byId.get(program.id)?.version !==
              program.version && (
              <InfoCallout title="Your selected version is preserved">
                A newer template is available. Compare it before making a new
                selection.
              </InfoCallout>
            )}
            <ProgramContent
              program={program}
              instance={current}
              update={(next) => {
                void update(next);
              }}
            />
            <button
              className="button secondary"
              onClick={() => setConfirm(true)}
            >
              Clear current selection
            </button>
            {confirm && (
              <div>
                <p>
                  Archive this selection? Its local preferences will be
                  retained.
                </p>
                <button
                  className="button primary"
                  onClick={() => {
                    const storage = createRecordStorage();
                    void clearCurrentProgram(storage, current)
                      .then(load)
                      .catch((error: Error) => setStatus(error.message))
                      .finally(() => storage.close());
                    setConfirm(false);
                  }}
                >
                  Confirm clear
                </button>
                <button
                  className="button secondary"
                  onClick={() => setConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        ) : (
          <InfoCallout title="The selected template version is unavailable">
            Your local selection is preserved. Restore the matching repository
            version or select another reviewed template.
          </InfoCallout>
        )
      ) : (
        !status && (
          <EmptyState
            title="No program selected."
            description="Browse or use the finder to choose a reviewed template."
          >
            <a className="button primary" href="/programs">
              Browse programs
            </a>
          </EmptyState>
        )
      )}
    </div>
  );
}
