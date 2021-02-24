import * as express from "express";
import * as status from "http-status";
import * as schema from "../helpers/schema";
import { Example } from "../models";

export const router = express.Router();

// create new account
router.post(
  "/",
  schema.validate(schema.EmailSchema),
  async (req, res, next) => {
    try {
      if (!req.body.email) {
        return next({
          message: "Email is required",
          status: status.BAD_REQUEST,
        });
      }
      const existingUser = await Example.findOne({ email: req.body.email });
      if (existingUser) {
        return next({
          message: "Account already exists",
          status: status.BAD_REQUEST,
        });
      }
      const example = new Example({
        email: req.body.email,
        timestamp: Date.now(),
      });
      await example.save();

      res.send({ message: "Successfully created account!" });
    } catch (e) {
      next(e);
    }
  }
);

// get all accounts
router.get("/", async (req, res, next) => {
  try {
    const examples = await Example.find();

    res.send({ accounts: examples });
  } catch (e) {
    next(e);
  }
});

// get one acccount
router.get(
  "/:id",
  schema.validate(schema.MongoIdSchema),
  async (req, res, next) => {
    try {
      if (!req.params.id) {
        return next({ message: "Id is required", status: status.BAD_REQUEST });
      }
      const existingUser = await Example.findOne({ _id: req.params.id });
      if (!existingUser) {
        return next({
          message: "Account not found",
          status: status.BAD_REQUEST,
        });
      }

      res.send({ account: existingUser });
    } catch (e) {
      next(e);
    }
  }
);

// create new account
router.delete(
  "/:id",
  schema.validate(schema.MongoIdSchema),
  async (req, res, next) => {
    try {
      if (!req.params.id) {
        return next({ message: "Id is required", status: status.BAD_REQUEST });
      }
      await Example.deleteOne({ _id: req.params.id });

      res.send({ message: "Successfully deleted account" });
    } catch (e) {
      next(e);
    }
  }
);
