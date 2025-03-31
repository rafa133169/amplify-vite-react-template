import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface Event {
  arguments: {
    tipoMaterial: string;
  };
}

export const handler = async (event: Event) => {
  const { tipoMaterial } = event.arguments;

  const params = {
    TableName: process.env.TABLE_NAME,
    IndexName: "byMaterial",
    KeyConditionExpression: "tipoMaterial = :tipoMaterial",
    ExpressionAttributeValues: {
      ":tipoMaterial": { S: tipoMaterial },
    },
  };

  try {
    const data = await docClient.send(new QueryCommand(params));
    return {
      statusCode: 200,
      body: data.Items || [],
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
