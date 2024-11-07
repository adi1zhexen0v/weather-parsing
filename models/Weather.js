import mongoose from "mongoose";

const weatherSchema = new mongoose.Schema({
  timestamp: Date,
  temperature: Number,
  humidity: Number,
  cloudiness: Number,
  weatherCondition: String,
  windSpeed: Number,
  pressure: Number,
  lightLevel: {
    type: Number,
    required: false
  },
  pwm: {
    type: Number,
    required: false
  }
});

export const Weather = mongoose.model("Weather", weatherSchema);
