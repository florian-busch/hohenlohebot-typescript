import { Schema } from 'mongoose';

export const textSchema = new Schema({
  text: { type: String, maxlength: 279 },
  posted: Date,
  already_posted: Boolean,
  category: { type: String, enum: ['Vokabel', 'Spruch', 'daysOfMuswiese'] }
});