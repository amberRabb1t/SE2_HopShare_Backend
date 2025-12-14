import Joi from 'joi';

// OpenAPI component schemas translated into Joi

export const routeBodySchema = Joi.object({
  RouteID: Joi.number().integer(),
  Start: Joi.string().required(),
  End: Joi.string().required(),
  Stops: Joi.string().required(),
  Comment: Joi.string().allow('', null),
  DateAndTime: Joi.number().integer().required(),
  OccupiedSeats: Joi.number().integer().required(),
  Rules: Joi.array().items(Joi.boolean()).default([]),
  Timestamp: Joi.number().integer()
}).required();

export const routeQuerySchema = Joi.object({
  Start: Joi.string(),
  End: Joi.string(),
  NoSmoking: Joi.boolean(),
  NoPets: Joi.boolean(),
  NoCats: Joi.boolean(),
  NoDogs: Joi.boolean(),
  DateAndTime: Joi.number().integer(),
  userID: Joi.number().integer()
});

export const reportBodySchema = Joi.object({
  Description: Joi.string().required(),
  ReportID: Joi.number().integer(),
  ReportedUser: Joi.number().integer().required(),
  State: Joi.boolean(),
  Timestamp: Joi.number().integer()
}).required();

export const reportQuerySchema = Joi.object({
  UserID: Joi.number().integer(),
  ReportID: Joi.number().integer(),
  State: Joi.boolean(),
  Timestamp: Joi.number().integer()
});

export const conversationBodySchema = Joi.object({
  ConversationID: Joi.number().integer(),
  ConversationName: Joi.string().required(),
  Timestamp: Joi.number().integer()
}).required();

export const messageBodySchema = Joi.object({
  MessageID: Joi.number().integer(),
  MessageText: Joi.string().required(),
  Timestamp: Joi.number().integer()
}).required();

export const carBodySchema = Joi.object({
  CarID: Joi.number().integer(),
  Seats: Joi.number().integer().required(),
  ServiceDate: Joi.number().integer().required(),
  MakeModel: Joi.string().required(),
  LicensePlate: Joi.string().required(),
  Timestamp: Joi.number().integer()
}).required();

export const requestBodySchema = Joi.object({
  RequestID: Joi.number().integer(),
  Description: Joi.string().allow('', null),
  Status: Joi.boolean(),
  Start: Joi.string().required(),
  End: Joi.string().required(),
  DateAndTime: Joi.number().integer().required(),
  Timestamp: Joi.number().integer()
}).required();

export const requestQuerySchema = Joi.object({
  Start: Joi.string(),
  End: Joi.string(),
  DateAndTime: Joi.number().integer(),
  userID: Joi.number().integer()
});

export const reviewBodySchema = Joi.object({
  ReviewID: Joi.number().integer(),
  Rating: Joi.number().required(),
  UserType: Joi.boolean().required(),
  Description: Joi.string().allow('', null),
  ReviewedUser: Joi.number().integer().required(),
  Timestamp: Joi.number().integer()
}).required();

export const userBodySchema = Joi.object({
  UserID: Joi.number().integer(),
  Name: Joi.string().required(),
  PhoneNumber: Joi.number().integer().required(),
  PassengerRating: Joi.number(),
  DriverRating: Joi.number(),
  Banned: Joi.boolean(),
  Email: Joi.string().email().required(),
  Password: Joi.string().min(6).required(),
  IsAdmin: Joi.boolean(),
  Timestamp: Joi.number().integer()
}).required();

export const usersQuerySchema = Joi.object({
  Name: Joi.string()
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().required()
});

