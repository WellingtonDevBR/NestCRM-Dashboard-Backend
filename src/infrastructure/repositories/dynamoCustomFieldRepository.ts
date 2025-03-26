import { CustomFieldRepository } from "../../domain/repositories/customFieldRepository";
import { PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
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

    async getAllFieldsGroupedByCategory(tenantId: string): Promise<Record<string, CustomField[]>> {
        const client = await initDynamoDB();
        const tableName = `NestCRM-${tenantId}-CustomFields`;

        const result = await client.send(new ScanCommand({
            TableName: tableName,
            FilterExpression: "begins_with(PK, :prefix)",
            ExpressionAttributeValues: {
                ":prefix": "CustomFieldSet#"
            }
        }));

        const groupedFields: Record<string, CustomField[]> = {};
        for (const item of result.Items || []) {
            const category = item.Category || "unknown";
            groupedFields[category] = item.Fields || [];
        }

        return groupedFields;
    }
}
