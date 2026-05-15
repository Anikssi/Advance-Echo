import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Echo Platform API",
      version: "1.0.0",
      description: "API documentation for the Echo Community Discussion Platform",
    },
    servers: [
      {
        url: "/api",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./server.ts", "./server/modules/*.ts"],
};

export const specs = swaggerJsdoc(options);
