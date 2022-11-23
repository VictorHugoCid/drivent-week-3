import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { listHotels, listRooms } from "@/controllers";

const hotelRouter = Router();

hotelRouter
  .all("/*", authenticateToken)
  .get("/", listHotels)
  .get("/:hotelId", listRooms );

export { hotelRouter };
