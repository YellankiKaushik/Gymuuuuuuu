// Immutable public release only. Personal meal plans have a separate storage adapter.
import records from "../../content/recipes/templates.json";
import { publicTemplateSchema, validatePublicRelease } from "./publication";
import { publicRecipes } from "./public-records";
export const publicTemplates = publicTemplateSchema.array().parse(records);
validatePublicRelease(publicRecipes, publicTemplates);
