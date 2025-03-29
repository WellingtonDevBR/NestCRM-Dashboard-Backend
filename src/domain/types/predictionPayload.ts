export interface PredictionPayload {
    field_mapping: Record<string, string>;
    data: Record<string, any>[];
}

export type PredictionMapping = Record<string, string>;
