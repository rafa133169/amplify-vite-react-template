import AWS from "aws-sdk";

const dynamoDB = new AWS.DynamoDB();

const createTable = async () => {
  const params: AWS.DynamoDB.CreateTableInput = {
    TableName: "Articulos", // Nombre de la tabla
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" }, // Clave primaria (id)
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" }, // id como String
      { AttributeName: "estado", AttributeType: "S" }, // estado como String
      { AttributeName: "tipo_material", AttributeType: "S" }, // tipo_material como String
    ],
    ProvisionedThroughput: {
      // Configuración de capacidad de la tabla
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
    GlobalSecondaryIndexes: [
      // Índice global secundario (GSI) para el tipo_material
      {
        IndexName: "tipo_material-index",
        KeySchema: [{ AttributeName: "tipo_material", KeyType: "HASH" }],
        Projection: {
          ProjectionType: "ALL",
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
  };

  try {
    const data = await dynamoDB.createTable(params).promise();
    console.log("Tabla creada exitosamente:", data);
  } catch (error) {
    console.error("Error al crear la tabla:", error);
  }
};

createTable();
