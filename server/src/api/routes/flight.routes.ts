import { Router } from "express";
import { query, param, ValidationChain } from "express-validator";

import FlightController from "../controllers/flight.controller";
import { openSkyApi } from "../services/openSkyNetworkApi";

// validation chains used for /flights and /flights/:icao24 routes
const getFlightsChain = (): ValidationChain[] => {
  return [
    query(
      ["latitudeMin", "latitudeMax", "longitudeMin", "longitudeMax"],
      "Bounding box coordinates must be defined and of type float!"
    )
      .isString()
      .notEmpty()
      .isFloat()
      .escape(),
    query("predict").optional().isString().isBoolean().escape(),
  ];
};

const getFlightChain = (): ValidationChain[] => {
  return [
    param("icao24", "ICAO24 must be an alphanumeric string!")
      .isString()
      .notEmpty()
      .isAlphanumeric()
      .escape(),
    query("predict").optional().isString().isBoolean().escape(),
  ];
};

const flightRouter = Router();
const controller = new FlightController(openSkyApi);

flightRouter.get(
  "/flights",
  getFlightsChain(),
  controller.flights.bind(controller)
);
flightRouter.get(
  "/flights/:icao24",
  getFlightChain(),
  controller.flight.bind(controller)
);

export default flightRouter;
