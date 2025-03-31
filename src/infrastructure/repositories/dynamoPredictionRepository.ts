import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { initDynamoDB } from "../database/dynamoDBClient";
import { PredictionRepository } from "../../domain/repositories/predictionRepository";
import { Prediction } from "../../domain/types/prediction";

export class DynamoPredictionRepository implements PredictionRepository {
    getTableName(subdomain: string): string {
        return `NestCRM-${subdomain}-Prediction`;
    }

    async savePrediction(subdomain: string, prediction: Prediction): Promise<void> {
        const client = await initDynamoDB();
        const customerId = prediction.customer_id;
        await client.send(
            new PutCommand({
                TableName: this.getTableName(subdomain),
                Item: {
                    id: customerId,
                    ...prediction,
                },
            })
        );
    }

    async getPredictions(subdomain: string): Promise<Prediction[]> {
        const client = await initDynamoDB();
        const result = await client.send(
            new ScanCommand({ TableName: this.getTableName(subdomain) })
        );
        return result.Items as Prediction[];
    }
}
