import { AxiosResponse } from "axios";
import api from "../api/api";
import { Tag } from "../types/tag";

const tag = {
  getMainTags: (): Promise<AxiosResponse<Tag[]>> => {
    return api.get("/tags", {
      transformResponse: composeTags,
    });
  },
};

const composeTags = (data: string): Tag[] => {
  const response = JSON.parse(data);

  if (!response.success) {
    throw new Error("Erro");
  }

  const tagsResponse = response.body.tags;

  const tags: Tag[] = [];
  tagsResponse.forEach((tagDto: Tag) => {
    tags.push({
      ...tagDto,
    });
  });
  return tags;
};

export default tag;
