import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { aws_lambda_nodejs } from "aws-cdk-lib";
import { fileURLToPath } from "url";
import path from "path";

// Obtener __dirname equivalente en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir el backend
const backend = defineBackend({
  auth,
  data,
});

// Acceder al stack de CDK
const cdkStack = backend.data.stack;

// Función helper para crear Lambda functions
const createLambda = (id: string, handler: string) => {
  return new aws_lambda_nodejs.NodejsFunction(cdkStack, id, {
    entry: path.join(__dirname, "functions", handler),
    environment: {
      TABLE_NAME: backend.data.resources.tables.Articulo.tableName,
    },
    bundling: {
      nodeModules: ["@aws-sdk/client-dynamodb", "@aws-sdk/lib-dynamodb"],
    },
  });
};

// Crear funciones Lambda
const functions = {
  getAll: createLambda("GetAllArticulosFn", "getAllArticulos.ts"),
  getByMaterial: createLambda(
    "GetArticulosByMaterialFn",
    "getArticulosByMaterial.ts"
  ),
  vender: createLambda("VenderArticuloFn", "venderArticulo.ts"),
  calcularPeso: createLambda("CalcularPesoTotalFn", "calcularPesoTotal.ts"),
};

// Asignar permisos
backend.data.resources.tables.Articulo.grantReadData(functions.getAll);
backend.data.resources.tables.Articulo.grantReadData(functions.getByMaterial);
backend.data.resources.tables.Articulo.grantReadWriteData(functions.vender);
backend.data.resources.tables.Articulo.grantReadData(functions.calcularPeso);

export default backend;
