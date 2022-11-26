import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createHotel,
  createRoom,
  createTicket,
  createTicketType,
  createTicketTypeNotPassing,
  createTicketTypePassing,
  createUser,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

// GET /hotel
describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();

    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  //WHEN TOKEN IS VALID
  //  no enrollment
  describe("when token is valid", () => {
    it("should respond with status 404 when there is no enrollment for given user", async () => {
      const token = await generateValidToken();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });
  // no ticket
  describe("when has enrollment", () => {
    it("should respond with status 404 when there is no ticket for given user", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });
  //  with ticket
  describe("when has ticket", () => {
    // ticketType not paid
    it("should respond with status 402 when the ticket.status is RESERVED", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });
    // ticket.isRemote true or ticket.includesHotel false
    it("should respond with status 401 when the ticketType.isRemote is true or ticket.Type.includesHotel is false", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeNotPassing();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });
  });

  describe("when ticket is PAID, isRemote is false and includesHotel is true", () => {
    it("should respond with empty array when there are no hotels created", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypePassing();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.body).toEqual([]);
    });

    it("should respond with status 200 and with existing Hotels data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypePassing();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([
        {
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
        },
      ]);
    });
  });
});

// GET rooms -> /hotel/hotelId
describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const hotelId = 100;

    const response = await server.get(`/hotels/${hotelId}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const hotelId = 1;
    const token = faker.lorem.word();

    const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const hotelId = 1;
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  // WHEN TOKEN IS VALID
  //  no enrollment
  describe("when token is valid", () => {
    it("should respond with status 404 when there is no enrollment for given user", async () => {
      const token = await generateValidToken();
      const hotel = await createHotel();
      const hotelId = hotel.id;

      const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });
  //has enrollment
  describe("when has enrollment", () => {
    it("should respond with status 404 when there is no ticket for given user", async () => {
      // default
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      // test
      const hotel = await createHotel();
      const hotelId = hotel.id;

      const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });
  //  with ticket
  describe("when has ticket", () => {
    // ticketType not paid
    it("should respond with status 402 when the ticket.status is RESERVED", async () => {
      // default
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      // test
      const hotel = await createHotel();
      const hotelId = hotel.id;

      const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });
    // ticket.isRemote true or ticket.includesHotel false
    it("should respond with status 401 when the ticketType.isRemote is true or ticket.Type.includesHotel is false", async () => {
      //default
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeNotPassing();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      // test
      const hotel = await createHotel();
      const hotelId = hotel.id;

      const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });
  });

  //   when everything is ok
  describe("when ticket is PAID, isRemote is false and includesHotel is true", () => {
    it("should respond with empty array when there are no rooms created", async () => {
      //default
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypePassing();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      //test
      const hotel = await createHotel();
      const hotelId = hotel.id;

      const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.body).toEqual([
        {
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
          Rooms: [],
        },
      ]);
    });

    it("should respond with status 200 and with existing Hotels data include the Rooms", async () => {
      //default
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypePassing();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      //test
      const hotel = await createHotel();
      const hotelId = hotel.id;
      const room = await createRoom(hotel.id);

      const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([
        {
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
          Rooms: [
            {
              id: room.id,
              name: room.name,
              capacity: room.capacity,
              hotelId: room.hotelId,
              createdAt: room.createdAt.toISOString(),
              updatedAt: room.updatedAt.toISOString(),
            },
          ],
        },
      ]);
    });
  });
});
