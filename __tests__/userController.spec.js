import cloudinary from "cloudinary";
import express from "express";
import request from "supertest";
import {
  deleteAccount,
  getMyProfile,
  signup,
  updateProfile,
} from "../controllers/userController.js";
import { errorMiddleware } from "../middlewares/error.js";
import { User } from "../models/user.js"; // <- Importation nommée correcte
import { sendToken } from "../utils/features.js";
// Mock précis de l'objet User
jest.mock("../models/user.js", () => ({
  User: {
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("cloudinary", () => ({
  v2: {
    uploader: {
      destroy: jest.fn(),
    },
  },
}));

jest.mock("../utils/features.js", () => ({
  sendToken: jest.fn(),
}));

describe("GET getMyProfile", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Injection simulée d'un utilisateur authentifié
    app.get("/api/v1/me", (req, res, next) => {
      req.user = { _id: "mockUserId" };
      return getMyProfile(req, res, next);
    });

    app.use(errorMiddleware);
  });

  it("should return user profile when user exists", async () => {
    const mockUser = {
      _id: "mockUserId",
      name: "Alice",
      email: "alice@example.com",
    };

    // Configure le mock ici
    User.findById.mockResolvedValue(mockUser);

    const res = await request(app).get("/api/v1/me");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.name).toBe("Alice");
  });

  it("should return 401 if user not found", async () => {
    User.findById.mockResolvedValue(null); // Simule aucun résultat

    const res = await request(app).get("/api/v1/me");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("no user found");
  });

  it("should return 500 if database error occurs", async () => {
    User.findById.mockRejectedValue(new Error("DB error")); // Simule une erreur MongoDB

    const res = await request(app).get("/api/v1/me");

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("DB error");
  });
});

describe("POST signup", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.post("/api/v1/signup", (req, res, next) => {
      return signup(req, res, next);
    });

    app.use(errorMiddleware);
  });

  it("should create a new user and return token", async () => {
    // Simule un utilisateur inexistant
    User.findOne.mockResolvedValue(null);

    // Simule un utilisateur créé
    const mockUser = {
      _id: "newUserId",
      username: "Bob",
      email: "bob@example.com",
      password: "hashed",
    };
    User.create.mockResolvedValue(mockUser);

    const mockSendToken = sendToken;
    mockSendToken.mockImplementation((user, res, message, code) => {
      res.status(code).json({ success: true, message, user });
    });

    const res = await request(app).post("/api/v1/signup").send({
      username: "Bob",
      email: "bob@example.com",
      password: "securepass",
      language: "fr",
      darkmode: false,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe("Bob");
    expect(User.findOne).toHaveBeenCalledWith({ email: "bob@example.com" });
    expect(User.create).toHaveBeenCalledWith({
      username: "Bob",
      email: "bob@example.com",
      password: "securepass",
      avatar: undefined,
      language: "fr",
      darkmode: false,
    });
    expect(mockSendToken).toHaveBeenCalledWith(
      mockUser,
      expect.any(Object),
      "registered successfully",
      200
    );
  });

  it("should return 400 if user already exists", async () => {
    const existingUser = {
      _id: "existingId",
      email: "bob@example.com",
    };

    // Simule un utilisateur déjà en base
    User.findOne.mockResolvedValue(existingUser);

    const res = await request(app).post("/api/v1/signup").send({
      username: "Bob",
      email: "bob@example.com",
      password: "securepass",
      language: "fr",
      darkmode: false,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User already exist");
  });
});

describe("PUT updateProfile", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.put("/api/v1/updateprofile", (req, res, next) => {
      req.user = { _id: "mockUserId" }; // Simule un utilisateur connecté
      return updateProfile(req, res, next);
    });

    app.use(errorMiddleware);
  });

  it("should update user profile and return 200", async () => {
    const mockUser = {
      _id: "mockUserId",
      username: "OldName",
      email: "old@example.com",
      save: jest.fn().mockResolvedValue(true), // simulate .save()
    };

    User.findById.mockResolvedValue(mockUser);

    const res = await request(app).put("/api/v1/updateprofile").send({
      username: "NewName",
      darkmode: true,
      nsfw: false,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Profile Updated Successfully");

    expect(mockUser.username).toBe("NewName");
    expect(mockUser.darkmode).toBe(true);
    expect(mockUser.nsfw).toBe(false);
    expect(mockUser.save).toHaveBeenCalled();
  });

  it("should return 401 if user not found", async () => {
    User.findById.mockResolvedValue(null); // simulate no user found

    const res = await request(app).put("/api/v1/updateprofile").send({
      username: "NewName",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("no user found");
  });
});

describe("DELETE deleteAccount", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    app.delete("/api/v1/user/deleteprofile", (req, res, next) => {
      req.user = { _id: "mockUserId" };
      return deleteAccount(req, res, next);
    });

    app.use(errorMiddleware);
  });

  it("should delete user and return 200", async () => {
    const mockUser = {
      _id: "mockUserId",
      avatar: {
        public_id: "avatar123",
      },
      deleteOne: jest.fn().mockResolvedValue(true),
    };

    User.findById.mockResolvedValue(mockUser);
    cloudinary.v2.uploader.destroy.mockResolvedValue({ result: "ok" });

    const res = await request(app).delete("/api/v1/user/deleteprofile");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Account deleted");

    expect(User.findById).toHaveBeenCalledWith("mockUserId");
    expect(cloudinary.v2.uploader.destroy).toHaveBeenCalledWith("avatar123");
    expect(mockUser.deleteOne).toHaveBeenCalled();
  });

  it("should return 401 if user not found", async () => {
    User.findById.mockResolvedValue(null);

    const res = await request(app).delete("/api/v1/user/deleteprofile");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("no user found");
  });
});
