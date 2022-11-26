import { prisma } from "@/config";

async function getHotels() {
  return prisma.hotel.findMany({});
}

async function getRooms(hotelId: number) {
  return prisma.hotel.findMany({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

const hotelRepository = {
  getHotels,
  getRooms,
};

export default hotelRepository;
