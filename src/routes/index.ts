import * as express from "express";

export const router = express.Router();
import { router as exampleRoute } from "./example";

// API entrypoint message
router.get("/", (req, res) => {
  res.send("This is your api!");
});

router.use("/example", exampleRoute);
