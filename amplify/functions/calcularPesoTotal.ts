import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

interface Event {
  arguments?: Record<string, any>;
}

interface Articulo {
  tipoMaterial?: { S?: string };
  pesoUnitario?: { N?: string };
  cantidad?: { N?: string };
  vendido?: { BOOL?: boolean };
}

export const handler = async (event: Event) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    FilterExpression: "vendido = :vendido",
    ExpressionAttributeValues: {
      ":vendido": { BOOL: false },
    },
  };

  try {
    const data = await docClient.send(new ScanCommand(params));
    const items = (data.Items as Articulo[]) || [];

    const pesoPorMaterial: Record<string, number> = {};

    items.forEach((item) => {
      const material = item.tipoMaterial?.S;
      const pesoUnitario = item.pesoUnitario?.N
        ? parseFloat(item.pesoUnitario.N)
        : 0;
      const cantidad = item.cantidad?.N ? parseInt(item.cantidad.N) : 0;

      if (material) {
        const peso = pesoUnitario * cantidad;

        if (!pesoPorMaterial[material]) {
          pesoPorMaterial[material] = 0;
        }

        pesoPorMaterial[material] += peso;
      }
    });

    return {
      statusCode: 200,
      body: pesoPorMaterial,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};
