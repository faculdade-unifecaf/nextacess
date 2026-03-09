import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

//Configuração básica para iniciar o app.ts
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(helmet());

//Chamar as rotas do index.ts

export default app;