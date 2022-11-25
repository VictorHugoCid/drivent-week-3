import { conflictError, notFoundError, paymentRequiredError, unauthorizedError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { TicketStatus } from "@prisma/client";

async function getHotels(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) {
    throw notFoundError;
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) {
    throw notFoundError;
  }
  if (ticket.status === TicketStatus.RESERVED) {
    throw paymentRequiredError;
  }
  if (ticket.TicketType.includesHotel === false || ticket.TicketType.isRemote === true) {
    throw unauthorizedError;
  }

  const hotels = await hotelRepository.getHotels();

  return hotels;
}

async function getRooms(hotelId: number, userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) {
    throw notFoundError;
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) {
    throw notFoundError;
  }
  if (ticket.status === TicketStatus.RESERVED) {
    throw paymentRequiredError;
  }
  if (ticket.TicketType.includesHotel === false || ticket.TicketType.isRemote === true) {
    throw unauthorizedError;
  }

  const rooms = await hotelRepository.getRooms(hotelId);

  return rooms;
}

const hotelServices = {
  getHotels,
  getRooms,
};

export default hotelServices;
