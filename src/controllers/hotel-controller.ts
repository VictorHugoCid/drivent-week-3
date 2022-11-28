import { AuthenticatedRequest } from "@/middlewares";
import hotelService from "@/services/hotel-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function listHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  try {
    const hotels = await hotelService.getHotels(userId);

    return res.status(200).send(hotels);
  } catch (error) {
    if (error.name === "notFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "paymentRequiredError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    if (error.name === "unauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function listRooms(req: AuthenticatedRequest, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const { hotelId } = req.params;

  try {
    const rooms = await hotelService.getRooms(Number(hotelId), userId);

    return res.status(200).send(rooms);
  } catch (error) {
    if (error.name === "notFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "paymentRequiredError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    if (error.name === "unauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    if (error.name === "preconditionFailedError") {
      return res.sendStatus(httpStatus.PRECONDITION_FAILED);
    }
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}
