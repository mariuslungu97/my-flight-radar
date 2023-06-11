import { Router } from "express";
import { query, param } from "express-validator";

import AirportController from "../controllers/airport.controller";
import { openSkyApi } from "../services/openSkyNetworkApi";

const getAirportsChain = () =>
  query(
    ["latitudeMin", "latitudeMax", "longitudeMin", "longitudeMax"],
    "Bounding box coordinates must be defined and of type float!"
  )
    .isString()
    .notEmpty()
    .isFloat()
    .escape();
const getAirportChain = () =>
  param("icao", "ICAO must be an alphanumeric string!")
    .isString()
    .notEmpty()
    .isAlphanumeric()
    .escape();

const airportRouter = Router();
const controller = new AirportController(openSkyApi);

airportRouter.get(
  "/airports",
  getAirportsChain(),
  controller.airports.bind(controller)
);
airportRouter.get(
  "/airports/:icao",
  getAirportChain(),
  controller.airport.bind(controller)
);

export default airportRouter;
