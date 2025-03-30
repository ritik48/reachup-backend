import { AsyncHandler } from "../types.js";
import { ApiError } from "./ApiError.js";
import { Request, Response, NextFunction } from "express";

const asyncHandler =
  (fn: AsyncHandler): AsyncHandler =>
  async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      if (error instanceof Error) {
        next(new ApiError(error.message, 401));
      } else {
        next(new ApiError("Something went wrong", 500));
      }
    }
  };

export { asyncHandler };
