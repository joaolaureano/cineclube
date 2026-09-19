import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Movie } from "./Movie";

@Entity({ name: "platform" })
export class Platform {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Movie, (movie) => movie.platforms)
  @JoinTable({
    name: "movie_platform",
    joinColumn: {
      name: "platform",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "movie",
      referencedColumnName: "id",
    },
  })
  movies: Movie[];

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
