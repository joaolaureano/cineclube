import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { MovieTag, UserTag, Achievement } from ".";

@Entity({ name: "tag" })
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => MovieTag, (movie_tag) => movie_tag.tag)
  @JoinColumn({
    name: "tag_id",
  })
  movies_tags: MovieTag[];

  @OneToMany(() => UserTag, (user_tag) => user_tag.tag)
  @JoinColumn({
    name: "tag_id",
  })
  user_tags: UserTag[];

  @OneToMany(() => Achievement, (achievement) => achievement.tag)
  achievements: Achievement[];

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
