import express from "express";
import { Controller, Route, Get, Tags, SuccessResponse, Path } from "tsoa";
import { Platform } from "../models";
import PlatformService from "../services/PlatformService";

import { HttpResponse } from "../utils/httpResponse";

@Route("platforms")
@Tags("PlatformController")
export class PlatformController extends Controller {
  @Get("/")
  @SuccessResponse("200")
  async getPlatforms(): Promise<PlatformResponse> {
    try {
      const platforms = await PlatformService.getPlatforms();

      if (platforms) {
        this.setStatus(200);
        return {
          success: true,
          message: `Found ${platforms.length} platforms.`,
          body: {
            platforms,
          },
        };
      }

      throw new Error();
    } catch (err) {
      this.setStatus(500);
      const error = err as Error;
      return {
        success: false,
        message: "Internal server error.",
        details: error.message,
      };
    }
  }
}
interface PlatformResponse extends HttpResponse {
  body?: {
    platforms?: Platform[];
  };
}
