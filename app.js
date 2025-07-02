import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
import { errorMiddleware } from "./middlewares/error.js";
import game from "./routes/game.js";
import user from "./routes/user.js";

import path from 'path';
import { fileURLToPath } from 'url';

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

config({
  path: "./data/config.env",
});

export const app = express();
app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: true,
    // sameSite: 'none',
    // secure: true
    //   origin: [process.env.FRONTEND_URI_1, process.env.FRONTEND_URI_2],
  })
);

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
      {
        url: "https://vglserver.onrender.com/",
      },
    ],
    components: {
      schemas: {
        Game: {
          type: "object",
          required: [
            "name",
            "steam_appid",
            "description",
            "release_date",
            "header_image",
          ],
          properties: {
            name: {
              type: "string",
              example: "Elden Ring",
            },
            steam_appid: {
              type: "integer",
              example: 1245620,
            },
            likes: {
              type: "integer",
              example: 100,
            },
            description: {
              type: "string",
              example: "A dark fantasy RPG with open world elements.",
            },
            required_age: {
              type: "integer",
              example: 16,
            },
            is_free: {
              type: "boolean",
              example: false,
            },
            dlc: {
              type: "array",
              items: { type: "string" },
              example: ["DLC Pack 1", "Expansion"],
            },
            release_date: {
              type: "object",
              properties: {
                coming_soon: { type: "boolean" },
                date: {
                  type: "string",
                  format: "date",
                  example: "2022-02-25",
                },
              },
            },
            header_image: {
              type: "string",
              example: "https://cdn.cloudflare.steam.com/images/cover.jpg",
            },
            developers: {
              type: "array",
              items: { type: "string" },
              example: ["FromSoftware"],
            },
            publishers: {
              type: "array",
              items: { type: "string" },
              example: ["Bandai Namco"],
            },
            platforms: {
              type: "object",
              properties: {
                windows: { type: "boolean" },
                mac: { type: "boolean" },
                linux: { type: "boolean" },
              },
              example: {
                windows: true,
                mac: false,
                linux: false,
              },
            },
            genres: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  description: { type: "string" },
                },
              },
              example: [
                { id: 1, description: "Action" },
                { id: 2, description: "Adventure" },
              ],
            },
            tags: {
              type: "array",
              items: { type: "string" },
              example: ["Souls-like", "Dark Fantasy"],
            },
            screenshots: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path_thumbnail: { type: "string" },
                  path_full: { type: "string" },
                },
              },
            },
            movies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  thumbnail: { type: "string" },
                  webm: {
                    type: "object",
                    properties: {
                      480: { type: "string" },
                      max: { type: "string" },
                    },
                  },
                  mp4: {
                    type: "object",
                    properties: {
                      480: { type: "string" },
                      max: { type: "string" },
                    },
                  },
                },
              },
            },
            descriptions: {
              type: "object",
              properties: {
                french: { type: "string" },
                english: { type: "string" },
              },
            },
          },
        },
        User: {
          type: "object",
          required: ["username", "email", "password"],
          properties: {
            username: {
              type: "string",
              example: "player123",
            },
            email: {
              type: "string",
              format: "email",
              example: "player@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "secret123",
            },
            avatar: {
              type: "object",
              properties: {
                public_id: { type: "string", example: "user_avatar_001" },
                url: {
                  type: "string",
                  format: "uri",
                  example: "https://cdn.cloudinary.com/avatar.jpg",
                },
              },
            },
            role: {
              type: "string",
              enum: ["admin", "user"],
              default: "user",
            },
            language: {
              type: "string",
              enum: ["en", "fr"],
              default: "en",
            },
            darkmode: {
              type: "boolean",
              default: true,
            },
            nsfw: {
              type: "boolean",
              default: false,
            },
            fav_games_list: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "60c123..." },
                  name: { type: "string", example: "Elden Ring" },
                  image: {
                    type: "string",
                    format: "uri",
                    example: "https://cdn.steam.com/img.jpg",
                  },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    example: ["RPG", "Fantasy"],
                  },
                },
              },
              default: [],
            },
            fav_tags_list: {
              type: "object",
              additionalProperties: { type: "integer" },
              example: {
                RPG: 12,
                Adventure: 7,
              },
            },
            need_to_recalculate: {
              type: "boolean",
              default: true,
            },
            top_fav_tags_list: {
              type: "array",
              items: { type: "string" },
              example: ["RPG", "Souls-like", "Action"],
            },
            otp: {
              type: "integer",
              example: 123456,
            },
            otp_expire: {
              type: "string",
              format: "date-time",
              example: "2024-07-01T12:00:00Z",
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"], // files containing annotations as above
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Pipeline logique
app.use("/api/v1/user", user);
app.use("/api/v1/game", game);
// app.use("/api/v1/dossier", dossierprojet);

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Servir le dossier statique
// app.use('/static', express.static(path.join(__dirname, 'dossierproj')));

// app.get('/dossier', (req, res) => {
//     res.sendFile(path.join(__dirname, 'dossierproj', 'dossierproj.html'));
// });


const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));

app.use(express.static(path.join(__dirname, 'dossierproj')));

app.get('/api/v1/dossier', (req, res) => {
    res.sendFile(path.join(__dirname, 'dossierproj', 'dossierproj.html'));
});
app.use(errorMiddleware);
