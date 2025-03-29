export interface ModelService {
    predictChurn(payload: {
        field_mapping: Record<string, string>,
        data: Record<string, any>[]
    }): Promise<any>;
}
