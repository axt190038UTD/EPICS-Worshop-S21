import * as compression from "compression";
import * as cors from "cors";
import * as express from "express";
import httpStatus = require("http-status");
import * as mongoose from "mongoose";
import * as morgan from "morgan";
import { router as indexRoute } from "./routes";
import { sendJoiValidationError } from "./helpers/errors";

// initialization
const unhandledRejection = require("unhandled-rejection");
const rejectionEmitter = unhandledRejection({
  timeout: 15,
});
rejectionEmitter.on("unhandledRejection", (error: any, promise: any) => {
  console.error("Promise rejection", promise);
});

// start API
console.log("===========================================");
console.log("API Starting");

// connect to mongo
const DATABASE_NAME = process.env.DATABASE_NAME || "api";
const DATABASE_URL =
  process.env.MONGODB_URI || `mongodb://localhost:27017/${DATABASE_NAME}`;
export const db = mongoose.connection;
mongoose
  .connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    // perform one-time database init here
    console.log(`[db] Connected on ${DATABASE_URL}`);
  })
  .catch((err: any) => {
    console.error(`[db] Failed to connect to ${DATABASE_URL}`, err);
    process.exit(1);
  });

// start web server
const SERVER_PORT = parseInt(process.env.PORT || "3000", 10);
const CORS_ORIGIN_LIST = (
  process.env.CORS_ORIGINS || "http://localhost:8080,http://localhost:8000"
).split(",");
console.log("CORS Origins", CORS_ORIGIN_LIST);

export const app = express();
app.listen(SERVER_PORT, () => {
  console.log(`Ready on port ${SERVER_PORT}`);
});

// middleware
app.use(
  cors({
    origin: CORS_ORIGIN_LIST,
    methods: ["GET", "PUT", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/", indexRoute);

// error handling
app.use((err: any, req: express.Request, res: express.Response) => {
  if (err.name && err.details && err.name === "ValidationError") {
    // Joi validation error
    console.warn(JSON.stringify(err.details, null, 2));
    res.status(httpStatus.BAD_REQUEST).send({
      message: "Some fields are invalid",
      errors: sendJoiValidationError(err),
    });
  } else if (err.status && err.message) {
    // general error
    console.warn(JSON.stringify(err, null, 2));
    res.status(err.status).send({
      message: err.message,
      errors: err.errors,
      detail: err.detail,
      code: err.code,
    });
  } else {
    console.error(err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "An internal error occurred.",
    });
  }
});

// handle 404s
app.use((req, res) => {
  res.status(404).send({ message: "Endpoint not found" });
});
