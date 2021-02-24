import { Schema, Document, model } from "mongoose";

export interface IExample extends Document {
  email: string;
  timestamp: Date;
}

export const ExampleSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  timestamp: { type: Date, required: true },
});

export default model<IExample>("Example", ExampleSchema);
