import * as express from "express";
import * as dotenv from "dotenv";
import * as cors from "cors";
import { Request, Response } from "express";
import { join } from "path";

import airportRouter from "./api/routes/airport.routes";
import flightRouter from "./api/routes/flight.routes";

type TDefaultRoute = {
  code: number;
  status: string;
  path: string;
};

const envPath = join(__dirname, "..", ".env");
dotenv.config({ path: envPath });

const app = express();

app.use(cors({ origin: process.env.APP_CORS_ORIGIN || "*" }));

app.use("/api", airportRouter);
app.use("/api", flightRouter);

// default handler
app.use((req: Request, res: Response<TDefaultRoute>) => {
  const url = req.originalUrl;
  res.json({ code: 404, status: "ROUTE_NOT_FOUND", path: url });
});

const port = (process.env.APP_PORT && +process.env.APP_PORT) || 5000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}!!`);
});
