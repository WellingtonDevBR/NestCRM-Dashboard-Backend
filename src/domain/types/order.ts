import { Associations } from "./associations";

export interface Order {
    customFields?: Record<string, any>;
    associations: Associations;
}
