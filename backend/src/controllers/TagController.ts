import express from "express";
import { Controller, Route, Get, Tags, SuccessResponse, Path } from "tsoa";
import { Tag } from "../models";
import TagService from "../services/TagService";

import { HttpResponse } from "../utils/httpResponse";

@Route("tags")
@Tags("TagController")
export class TagController extends Controller {
  @Get("/")
  @SuccessResponse("200")
  async getMainTags(): Promise<TagResponse> {
    try {
      const mainTags = await TagService.getMainTags();

      if (mainTags) {
        this.setStatus(200);
        return {
          success: true,
          message: `Found ${mainTags.length} tags.`,
          body: {
            tags: mainTags,
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
interface TagResponse extends HttpResponse {
  body?: {
    tags?: Tag[];
  };
}
