import { notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getHotels(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) {
    throw notFoundError;
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) {
    throw notFoundError;
  }
  const hotels = await hotelRepository.getHotels();

  return hotels;
}

async function getRooms(hotelId: number) {
  const rooms = await hotelRepository.getRooms(hotelId);

  return rooms;
}

const hotelServices = {
  getHotels,
  getRooms,
};

export default hotelServices;
