import { Router } from "express";
import { authenticateToken } from "@/middlewares";
// import { getEnrollmentByUser, postCreateOrUpdateEnrollment, getAddressFromCEP } from "@/controllers";

const hotelRouter = Router();

hotelRouter
  .all("/*", authenticateToken)
  .get("/")
  .get("/:id" );

export { hotelRouter };
