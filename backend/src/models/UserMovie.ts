import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { Movie, User } from ".";

@Entity("user_movie")
export class UserMovie {
  @PrimaryColumn()
  user_id: string;

  @PrimaryColumn()
  movie_id: number;

  @Column()
  status: string;

  @ManyToOne(() => User, (user) => user.movies)
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.users)
  movie: Movie;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
