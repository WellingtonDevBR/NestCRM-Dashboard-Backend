import { initDynamoDB } from "../database/dynamoDBClient";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { MappingEntry, PredictionFieldMappingRepository } from "../../domain/repositories/predictionFieldMappingRepository";

export class DynamoPredictionFieldMappingRepository implements PredictionFieldMappingRepository {
    async saveMappings(tenantId: string, mappings: MappingEntry[]): Promise<void> {
        const client = await initDynamoDB();
        await client.send(new PutCommand({
            TableName: `NestCRM-${tenantId}-CustomFields`,
            Item: {
                PK: "PredictionMapping",
                Mappings: mappings,
            },
        }));
    }

    async getMappings(tenantId: string): Promise<MappingEntry[]> {
        const client = await initDynamoDB();
        const result = await client.send(new GetCommand({
            TableName: `NestCRM-${tenantId}-CustomFields`,
            Key: { PK: "PredictionMapping" },
        }));
        return result.Item?.Mappings || [];
    }
}
