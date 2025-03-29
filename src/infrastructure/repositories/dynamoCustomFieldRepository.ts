import { CustomFieldRepository } from "../../domain/repositories/customFieldRepository";
import { PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { initDynamoDB } from "../database/dynamoDBClient";
import { CustomField, FieldCategory } from "../../domain/types/customFields";

export class DynamoCustomFieldRepository implements CustomFieldRepository {
    async saveFields(
        tenantId: string,
        fields: CustomField[],
        category: FieldCategory,
    ): Promise<void> {
        const client = await initDynamoDB();
        const tableName = `NestCRM-${tenantId}-CustomFields`;
        const pk = `CustomFieldSet#${category}`;

        await client.send(new PutCommand({
            TableName: tableName,
            Item: {
                PK: pk,
                Category: category,
                Fields: fields
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

    async getAllFieldsGroupedByCategory(tenantId: string): Promise<Record<FieldCategory, CustomField[]>> {
        const client = await initDynamoDB();
        const tableName = `NestCRM-${tenantId}-CustomFields`;

        const result = await client.send(new ScanCommand({
            TableName: tableName,
            FilterExpression: "begins_with(PK, :prefix)",
            ExpressionAttributeValues: {
                ":prefix": "CustomFieldSet#"
            }
        }));

        const groupedFields: Record<FieldCategory, CustomField[]> = {
            Customer: [],
            Order: [],
            Payment: [],
            Interaction: [],
            Support: [],
        };

        for (const item of result.Items || []) {
            const category = item.Category as FieldCategory;
            if (category in groupedFields) {
                groupedFields[category] = item.Fields || [];
            }
        }

        return groupedFields;
    }

    async savePredictionMapping(
        tenantId: string,
        mapping: Record<string, string>
    ): Promise<void> {
        const client = await initDynamoDB();
        const tableName = `NestCRM-${tenantId}-CustomFields`;

        // Transform mapping into a list of modelField <-> tenantField pairs
        const Mappings = Object.entries(mapping).map(([modelField, tenantField]) => ({
            modelField,
            tenantField,
        }));

        await client.send(new PutCommand({
            TableName: tableName,
            Item: {
                PK: "PredictionMapping",
                Mappings
            },
        }));
    }


    async getMappedFields(tenantId: string): Promise<Record<string, string>> {
        const client = await initDynamoDB();
        const tableName = `NestCRM-${tenantId}-CustomFields`;
        const result = await client.send(new GetCommand({
            TableName: tableName,
            Key: { PK: "PredictionMapping" }
        }));

        const mappings = result.Item?.Mappings || [];
        const mapObj: Record<string, string> = {};
        for (const m of mappings) {
            const modelField = m.modelField || m.M?.modelField?.S;
            const tenantField = m.tenantField || m.M?.tenantField?.S;
            if (modelField && tenantField) {
                mapObj[modelField] = tenantField;
            }
        }
        return mapObj;
    }

    async getCustomerData(tenantId: string): Promise<Record<string, any>[]> {
        // Replace this mock with actual queries using associations
        const mockData = [
            {
                customer_id: "cust-001",
                Age: 28,
                Gender: 1,
                Partner: "Single",
                Tenure: 12,
                Usage_Frequency: 15,
                Total_Spend: 500.0,
                Support_Calls: 2,
                Payment_Delay: 3,
                Subscription_Type: "Standard",
                Contract_Length: "Monthly",
                Days_Since_Last_Interaction: 10
            }
        ];
        return mockData;
    }
}
