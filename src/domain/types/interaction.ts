import { Associations } from "./associations";

export interface Interaction {
    customFields?: Record<string, any>;
    associations: Associations;
}
