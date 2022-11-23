import { notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";

async function getHotels() {
  const hotels = await hotelRepository.getHotels();

  return hotels;
}

async function getRooms(hotelId: number) {
  const rooms = await hotelRepository.getRooms(hotelId);

  return rooms;
}

const hotelServices = {
  getHotels,
  getRooms
};

export default hotelServices;
