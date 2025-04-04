/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a
  .schema({
    Articulo: a
      .model({
        id: a.id().required(),
        nombre: a.string().required(),
        fechaIngreso: a.string().required(), // Cambiado de datetime a string
        tipoMaterial: a.string().required(),
        pesoUnitario: a.float().required(),
        cantidad: a.integer(),
        precioCompra: a.float(),
        vendido: a.boolean().default(false),
        fechaVenta: a.string(), // Cambiado de date a string
        precioVenta: a.float(),
        descripcion: a.string(),
        imagen: a.string(),
      })
      .authorization((allow) => [
        // Permite a todos los usuarios autenticados acceder a todos los artículos
        allow.authenticated().to(["read", "create", "update", "delete"]),
      ]),
  })
  .authorization((allow) => [allow.authenticated()]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
