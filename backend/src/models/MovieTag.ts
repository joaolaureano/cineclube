import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { Movie, Tag } from ".";

@Entity({ name: "movie_tag" })
export class MovieTag {
  @PrimaryColumn()
  tag_id: number;

  @PrimaryColumn()
  movie_id: number;

  @Column()
  super: boolean;

  @Column()
  weight: number;

  @ManyToOne(() => Tag, (tag) => tag.movies_tags)
  tag: Tag;

  @ManyToOne(() => Movie, (movie) => movie.movies_tags)
  movie: Movie;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
