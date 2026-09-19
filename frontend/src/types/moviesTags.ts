import { Tag } from "./tag";

export interface MoviesTags {
  movie_id: number;
  tag_id: number;
  weight: number;
  super: boolean;
  tag: Tag; //Objeto Tag
  created_at: Date;
  updated_at: Date;
}
