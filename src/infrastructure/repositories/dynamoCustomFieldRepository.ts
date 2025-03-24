import { CustomFieldRepository } from "../../domain/repositories/customFieldRepository";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { initDynamoDB } from "../database/dynamoDBClient";
import { CustomField } from "../../domain/types/customFields";

export class DynamoCustomFieldRepository implements CustomFieldRepository {
    async saveFields(tenantId: string, fields: CustomField[]): Promise<void> {
        const client = await initDynamoDB();
        const tableName = `NestCRM-${tenantId}-CustomFields`;
        await client.send(new PutCommand({
            TableName: tableName,
            Item: {
                PK: `CustomFieldSet#${tenantId}`,
                Fields: fields,
            },
        }));
    }

    async getFields(tenantId: string): Promise<CustomField[]> {
        const client = await initDynamoDB();
        const tableName = `NestCRM-${tenantId}-CustomFields`;
        const result = await client.send(new GetCommand({
            TableName: tableName,
            Key: { PK: `CustomFieldSet#${tenantId}` },
        }));

        return result.Item?.Fields || [];
    }
}