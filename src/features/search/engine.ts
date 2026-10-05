import type { PublicSearchDocument, SearchEntityType } from "./domain";
import { foldDiacritics, normalizeSearchText, tokenizeSearchText } from "./domain";

export type MatchReason = { field: "title" | "aliases" | "keywords" | "summary" | "headings" | "body"; kind: "exact" | "prefix" | "fuzzy"; value: string };
export type SearchableDocument = Pick<PublicSearchDocument, "documentId" | "entityType" | "entityId" | "entityVersion" | "sourceModule" | "route" | "title" | "normalizedTitle" | "aliases" | "normalizedAliases" | "summary" | "keywords" | "headings" | "searchableBody" | "facets" | "lastReviewedAt">;
export type SearchResult = { document: SearchableDocument; score: number; reasons: MatchReason[] };
export type SearchOptions = { query: string; types?: readonly SearchEntityType[]; modules?: readonly string[]; savedOnly?: boolean; favouriteDocumentIds?: ReadonlySet<string>; sort?: "relevance" | "title_asc" | "title_desc" | "reviewed_desc"; page?: number; pageSize?: number };
export type SearchResponse = { total: number; page: number; pageSize: number; results: SearchResult[] };
const boosts: Record<MatchReason["field"], number> = { title: 8, aliases: 6, keywords: 4, summary: 2, headings: 1.5, body: 1 };
const entityPriority: SearchEntityType[] = ["route", "muscle", "exercise", "workout_science_topic", "workout_program", "food", "nutrient", "recipe", "recovery_topic", "recovery_routine", "cardio_topic", "cardio_modality", "cardio_plan", "supplement_ingredient", "supplement_evidence_topic", "measurement_protocol", "progress_topic", "dashboard_widget", "workout_session", "diet_plan", "meal_plan", "sleep_entry", "recovery_checkin", "conditioning_routine", "body_measurement"];
const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });

export function boundedEditDistance(left: string, right: string, limit: number) {
  if (Math.abs(left.length - right.length) > limit) return limit + 1;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i++) {
    const current = [i]; let rowMinimum = i;
    for (let j = 1; j <= right.length; j++) {
      const value = Math.min(current[j - 1]! + 1, previous[j]! + 1, previous[j - 1]! + (left[i - 1] === right[j - 1] ? 0 : 1));
      current[j] = value; rowMinimum = Math.min(rowMinimum, value);
    }
    if (rowMinimum > limit) return limit + 1;
    previous = current;
  }
  return previous[right.length]!;
}
export function fuzzyLimit(token: string) {
  if (token.length <= 3 || /\p{N}/u.test(token)) return 0;
  return token.length <= 7 ? 1 : 2;
}
function fieldText(document: SearchableDocument, field: MatchReason["field"]): string[] {
  if (field === "title") return [document.title];
  if (field === "aliases") return document.aliases;
  if (field === "keywords") return document.keywords;
  if (field === "summary") return [document.summary];
  if (field === "headings") return document.headings;
  return [document.searchableBody];
}
function tokenMatch(queryToken: string, text: string, field: MatchReason["field"]): MatchReason | null {
  const norm = normalizeSearchText(text), tokens = tokenizeSearchText(text);
  if (!norm) return null;
  if (field === "title" && foldDiacritics(norm) === foldDiacritics(queryToken) || field === "aliases" && foldDiacritics(norm) === foldDiacritics(queryToken)) return { field, kind: "exact", value: text };
  if (tokens.includes(queryToken)) return { field, kind: "exact", value: text };
  if (tokens.some((token) => token.startsWith(queryToken))) return { field, kind: "prefix", value: text };
  const folded = foldDiacritics(queryToken), foldedTokens = tokens.map(foldDiacritics);
  if (foldedTokens.includes(folded)) return { field, kind: "exact", value: text };
  if (foldedTokens.some((token) => token.startsWith(folded))) return { field, kind: "prefix", value: text };
  const limit = fuzzyLimit(queryToken);
  if (limit > 0 && tokens.some((token) => boundedEditDistance(queryToken, token, limit) <= limit)) return { field, kind: "fuzzy", value: text };
  return null;
}
function matchDocument(document: SearchableDocument, query: string): SearchResult | null {
  const tokens = tokenizeSearchText(query);
  if (!tokens.length) return null;
  const fields: MatchReason["field"][] = ["title", "aliases", "keywords", "summary", "headings", "body"], reasons: MatchReason[] = [];
  for (const queryToken of tokens) {
    const candidates = fields.flatMap((field) => fieldText(document, field).flatMap((value) => { const reason = tokenMatch(queryToken, value, field); return reason ? [reason] : []; }));
    candidates.sort((a, b) => (b.kind === "exact" ? 3 : b.kind === "prefix" ? 2 : 1) * boosts[b.field] - (a.kind === "exact" ? 3 : a.kind === "prefix" ? 2 : 1) * boosts[a.field]);
    const best = candidates[0];
    if (!best) return null;
    reasons.push(best);
  }
  const normalized = normalizeSearchText(query), title = document.normalizedTitle;
  let score = reasons.reduce((total, reason) => total + boosts[reason.field] * (reason.kind === "exact" ? 3 : reason.kind === "prefix" ? 2 : 1), 0);
  const exactTitle = foldDiacritics(title) === foldDiacritics(normalized), exactAlias = document.normalizedAliases.some((alias) => foldDiacritics(alias) === foldDiacritics(normalized)), titlePrefix = foldDiacritics(title).startsWith(foldDiacritics(normalized)), aliasPrefix = document.normalizedAliases.some((alias) => foldDiacritics(alias).startsWith(foldDiacritics(normalized)));
  if (exactTitle) score += 100;
  else if (exactAlias) score += 80;
  else if (titlePrefix) score += 40;
  else if (aliasPrefix) score += 30;
  if (reasons.some((reason) => reason.kind === "fuzzy")) score *= 0.6;
  return { document, score, reasons };
}
export function searchDocuments(documents: readonly SearchableDocument[], options: SearchOptions): SearchResponse {
  const query = options.query.trim().slice(0, 120), pageSize = Math.min(50, Math.max(1, options.pageSize ?? 20)), requestedPage = Math.max(1, Math.floor(options.page ?? 1));
  if (!query || tokenizeSearchText(query).length > 16) return { total: 0, page: 1, pageSize, results: [] };
  const types = new Set(options.types ?? []), modules = new Set(options.modules ?? []), favourites = options.favouriteDocumentIds ?? new Set<string>();
  const matches = documents.filter((document) => !types.size || types.has(document.entityType)).filter((document) => !modules.size || modules.has(document.sourceModule)).filter((document) => !options.savedOnly || favourites.has(document.documentId)).flatMap((document) => { const result = matchDocument(document, query); return result ? [result] : []; });
  matches.sort((a, b) => {
    if (options.sort === "title_asc") return collator.compare(a.document.title, b.document.title) || a.document.entityId.localeCompare(b.document.entityId);
    if (options.sort === "title_desc") return collator.compare(b.document.title, a.document.title) || a.document.entityId.localeCompare(b.document.entityId);
    if (options.sort === "reviewed_desc") return (b.document.lastReviewedAt ?? "").localeCompare(a.document.lastReviewedAt ?? "") || collator.compare(a.document.title, b.document.title) || a.document.entityId.localeCompare(b.document.entityId);
    return b.score - a.score || (types.size || modules.size ? 0 : entityPriority.indexOf(a.document.entityType) - entityPriority.indexOf(b.document.entityType)) || collator.compare(a.document.title, b.document.title) || a.document.entityId.localeCompare(b.document.entityId);
  });
  const page = Math.max(1, Math.min(requestedPage, Math.max(1, Math.ceil(matches.length / pageSize))));
  return { total: matches.length, page, pageSize, results: matches.slice((page - 1) * pageSize, page * pageSize) };
}
export function suggestDocuments(documents: readonly SearchableDocument[], query: string, limit = 8) {
  const normalized = normalizeSearchText(query);
  if (normalized.length < 2) return [];
  return searchDocuments(documents, { query, page: 1, pageSize: Math.min(8, Math.max(1, limit)) }).results;
}

export interface SearchEngineAdapter {
  build(documents: readonly PublicSearchDocument[], serializedPostings?: Readonly<Record<string, readonly number[]>>): Promise<{ documentCount: number; tokenCount: number }>;
  search(options: SearchOptions): Promise<SearchResponse>;
  suggest(query: string): Promise<SearchResult[]>;
  dispose(): void;
}
export class LocalSearchEngine implements SearchEngineAdapter {
  private documents: readonly SearchableDocument[] = [];
  private postings = new Map<string, ReadonlySet<number>>();
  private disposed = false;
  async build(documents: readonly SearchableDocument[], serializedPostings?: Readonly<Record<string, readonly number[]>>) {
    this.documents = [...documents];
    const built = new Map<string, Set<number>>();
    if (serializedPostings) for (const [token, positions] of Object.entries(serializedPostings)) built.set(token, new Set(positions.filter((position) => position < this.documents.length)));
    else this.documents.forEach((document, position) => { const tokens = new Set(tokenizeSearchText(`${document.title} ${document.aliases.join(" ")} ${document.keywords.join(" ")} ${document.summary} ${document.headings.join(" ")} ${document.searchableBody}`)); for (const token of tokens) { const positions = built.get(token) ?? new Set<number>(); positions.add(position); built.set(token, positions); } });
    this.postings = built;
    this.disposed = false;
    return { documentCount: this.documents.length, tokenCount: this.postings.size };
  }
  private candidates(query: string) {
    const queryTokens = tokenizeSearchText(query);
    if (!queryTokens.length || queryTokens.length > 16) return [];
    let candidates: Set<number> | null = null;
    for (const queryToken of queryTokens) {
      const matching = new Set<number>(), limit = fuzzyLimit(queryToken), folded = foldDiacritics(queryToken);
      for (const [token, positions] of this.postings) {
        if (token === queryToken || token.startsWith(queryToken) || foldDiacritics(token) === folded || foldDiacritics(token).startsWith(folded) || limit > 0 && boundedEditDistance(queryToken, token, limit) <= limit) for (const position of positions) matching.add(position);
      }
      if (candidates === null) candidates = matching;
      else { const intersection = new Set<number>(); candidates.forEach((position) => { if (matching.has(position)) intersection.add(position); }); candidates = intersection; }
      if (!candidates.size) return [];
    }
    return [...(candidates ?? [])].map((position) => this.documents[position]!).filter(Boolean);
  }
  async search(options: SearchOptions) { return this.disposed ? { total: 0, page: 1, pageSize: options.pageSize ?? 20, results: [] } : searchDocuments(this.candidates(options.query), options); }
  async suggest(query: string) { return this.disposed ? [] : (await this.search({ query, page: 1, pageSize: 8 })).results; }
  dispose() { this.documents = []; this.postings.clear(); this.disposed = true; }
}
