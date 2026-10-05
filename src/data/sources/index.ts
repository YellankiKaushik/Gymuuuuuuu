import rawSources from "../../content/muscles/sources.json";
import { sourceSchema } from "../../domain/schemas/foundation";
export const sourceRegistry = sourceSchema.array().parse(rawSources);
