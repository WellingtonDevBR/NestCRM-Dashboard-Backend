import { CustomFieldRepository } from "../../domain/repositories/CustomFieldRepository";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { initDynamoDB } from "../database/DynamoDBClient";
import { CustomField } from "../../domain/types/customFields";

export class DynamoCustomFieldRepository implements CustomFieldRepository {
    private tableName = "NestCRM-CustomFieldDefinitions";

    async saveFields(tenantId: string, fields: CustomField[]): Promise<void> {
        const client = await initDynamoDB();
        await client.send(new PutCommand({
            TableName: this.tableName,
            Item: {
                TenantId: tenantId,
                Fields: fields,
            },
        }));
    }

    async getFields(tenantId: string): Promise<CustomField[]> {
        const client = await initDynamoDB();
        const result = await client.send(new GetCommand({
            TableName: this.tableName,
            Key: { TenantId: tenantId },
        }));

        return result.Item?.Fields || [];
    }
}
