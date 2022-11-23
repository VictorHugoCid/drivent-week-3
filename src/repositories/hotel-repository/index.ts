import { prisma } from "@/config";

async function getHotels() {
  return prisma.hotel.findMany({});
}

async function getRooms(hotelId: number) {
  return prisma.room.findMany({
    where: {
      hotelId,
    },
  });
}

const hotelRepository = {
  getHotels,
  getRooms,
};

export default hotelRepository;
