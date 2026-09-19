import { getCustomRepository } from "typeorm";
import { Tag } from "../models";
import { TagRepository } from "../repositories";

const mainTags = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Documentary",
  "Drama",
  "Horror",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

const getMainTags = async (): Promise<Tag[]> => {
  const tagRepository = getCustomRepository(TagRepository);

  const tags = await tagRepository
    .createQueryBuilder("tag")
    .where(`"tag"."name" IN (:...tags)`, { tags: mainTags })
    .getMany();

  return tags;
};

export default {
  getMainTags,
};
