export interface MappingEntry {
    modelField: string;
    customerField: string;
}

export interface PredictionFieldMappingRepository {
    saveMappings(tenantId: string, mappings: MappingEntry[]): Promise<void>;
    getMappings(tenantId: string): Promise<MappingEntry[]>;
}