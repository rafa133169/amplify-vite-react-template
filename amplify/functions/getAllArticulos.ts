import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface Event {
  arguments?: Record<string, any>;
}

export const handler = async (event: Event) => {
  const params = {
    TableName: process.env.TABLE_NAME
  };

  try {
    const data = await docClient.send(new ScanCommand(params));
    return {
      statusCode: 200,
      body: data.Items || []
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err)
    };
  }
};