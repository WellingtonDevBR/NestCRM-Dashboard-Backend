import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { initDynamoDB } from "../database/dynamoDBClient";
import { Customer } from "../../domain/types/customer";
import { CustomerRepository } from "../../domain/repositories/customerRepository";

export class DynamoCustomerRepository implements CustomerRepository {
    getTableName(subdomain: string): string {
        return `NestCRM-${subdomain}-Customer`;
    }

    async saveCustomer(subdomain: string, customer: Customer): Promise<void> {
        const client = await initDynamoDB();
        await client.send(
            new PutCommand({
                TableName: this.getTableName(subdomain),
                Item: customer,
            })
        );
    }

    async getCustomers(subdomain: string): Promise<Customer[]> {
        const client = await initDynamoDB();
        const result = await client.send(
            new ScanCommand({ TableName: this.getTableName(subdomain) })
        );
        return result.Items as Customer[];
    }
}