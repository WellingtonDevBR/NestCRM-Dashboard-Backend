// infrastructure/services/pythonModelService.ts
import axios from "axios";
import { ModelService } from "../../domain/services/aiServices";

export class PythonModelService implements ModelService {
    async predictChurn(payload: {
        field_mapping: Record<string, string>,
        data: Record<string, any>[]
    }): Promise<any> {
        const response = await axios.post(`${process.env.PYTHON_MODEL_URL}/predict`, payload);
        return response.data;
    }
}
