import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface Event {
  arguments: {
    id: string;
    precioVenta: number;
  };
}

export const handler = async (event: Event) => {
  const { id, precioVenta } = event.arguments;

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      id: { S: id },
    },
    UpdateExpression:
      "SET vendido = :vendido, fechaVenta = :fechaVenta, precioVenta = :precioVenta",
    ExpressionAttributeValues: {
      ":vendido": { BOOL: true },
      ":fechaVenta": { S: new Date().toISOString() },
      ":precioVenta": { N: precioVenta.toString() },
    },
    ReturnValues: "ALL_NEW" as const,
  };

  try {
    const data = await docClient.send(new UpdateCommand(params));
    return {
      statusCode: 200,
      body: data.Attributes,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
