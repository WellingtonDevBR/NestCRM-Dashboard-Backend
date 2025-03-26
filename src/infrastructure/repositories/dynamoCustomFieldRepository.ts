import { CustomFieldRepository } from "../../domain/repositories/customFieldRepository";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { initDynamoDB } from "../database/dynamoDBClient";
import { CustomField, FieldCategory } from "../../domain/types/customFields";

export class DynamoCustomFieldRepository implements CustomFieldRepository {
    async saveFields(tenantId: string, fields: CustomField[], category: FieldCategory): Promise<void> {
        const client = await initDynamoDB();
        const tableName = `NestCRM-${tenantId}-CustomFields`;
        const pk = `CustomFieldSet#${category}`;

        await client.send(new PutCommand({
            TableName: tableName,
            Item: {
                PK: pk,
                Category: category,
                Fields: fields,
            },
        }));
    }

    async getFields(tenantId: string, category: FieldCategory): Promise<CustomField[]> {
        const client = await initDynamoDB();
        const tableName = `NestCRM-${tenantId}-CustomFields`;
        const pk = `CustomFieldSet#${category}`;

        const result = await client.send(new GetCommand({
            TableName: tableName,
            Key: { PK: pk },
        }));

        return result.Item?.Fields || [];
    }
}
