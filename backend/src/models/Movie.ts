import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { MovieTag, Platform, UserMovie, Cast } from ".";

@Entity({ name: "movie" })
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  original_title: string;

  @Column({
    type: "text",
  })
  synopsis: string;

  @Column({
    type: "text",
  })
  critic: string;

  @Column()
  curator: string;

  @Column({
    length: 4,
    type: "varchar",
  })
  year: number;

  @Column({
    type: "text",
  })
  path_banner: string;

  @Column()
  duration: number;

  @ManyToMany(() => Platform, (platform) => platform.movies, {
    cascade: true,
  })
  platforms: Platform[];

  @OneToMany(() => UserMovie, (userMovie) => userMovie.movie)
  @JoinColumn({
    name: "movie_id",
  })
  users: UserMovie[];

  @OneToMany(() => MovieTag, (movie_tag) => movie_tag.movie)
  @JoinColumn({
    name: "movie_id",
  })
  movies_tags: MovieTag[];

  @OneToMany(() => Cast, (cast) => cast.movie)
  @JoinColumn({
    name: "movie_id",
  })
  cast: Cast[];

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
