import { Associations } from "./associations";

export interface Payment {
    customFields?: Record<string, any>;
    associations: Associations;
}
