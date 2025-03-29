import { Associations } from "./associations";

export interface Support {
    customFields?: Record<string, any>;
    associations: Associations;
}
