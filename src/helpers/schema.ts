import * as Joi from "joi";
import { Request, Response, NextFunction } from "express";

const MONGO_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { value, error } = schema.validate(req, {
      abortEarly: false,
      allowUnknown: true,
    });
    if (error) return next(error);

    req.params = value.params;
    req.body = value.body;
    req.query = value.query;
    next();
  };
}

export const MongoIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required().regex(MONGO_ID_REGEX),
  }),
});

export const EmailSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().required().lowercase().trim().email(),
  }).unknown(false),
});
