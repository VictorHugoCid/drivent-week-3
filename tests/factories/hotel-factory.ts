import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { Room } from "@prisma/client";

export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      id: faker.datatype.number({ min: 1, max: 138 }),
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
      
    },
    include: {
      Rooms: true,
    },
  });
}

export async function createRoom(hotelId: number) {
  return prisma.room.create({
    data: {
      id: faker.datatype.number({ min: 1, max: 138 }),
      name: faker.name.findName(),
      capacity: faker.datatype.number({ min: 1, max: 10 }),
      hotelId,
    },
  });
}

// model Room {
//   id        Int       @id @default(autoincrement())
//   name      String
//   capacity  Int
//   hotelId   Int
//   Hotel     Hotel     @relation(fields: [hotelId], references: [id])
//   Booking   Booking[]
//   createdAt DateTime  @default(now())
//   updatedAt DateTime  @updatedAt
// }

// model Hotel {
//   id        Int      @id @default(autoincrement())
//   name      String
//   image     String
//   Rooms     Room[]
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }

// export async function findHotel() {
//   const bolinha = prisma.hotel.findFirst({});
//   bolinha.Rooms.arguments

// }
