import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserMovie, UserAchievement, UserTag } from "./";

@Entity({ name: "app_user" })
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  photo_path: string;

  @Column()
  randomness: number;

  @OneToMany(() => UserMovie, (userMovie) => userMovie.user)
  @JoinColumn({
    name: "user_id",
  })
  movies: UserMovie[];

  @OneToMany(() => UserTag, (user_tag) => user_tag.user)
  @JoinColumn({
    name: "user_id",
  })
  user_tags: UserTag[];

  @OneToMany(() => UserAchievement, (userAchievemnt) => userAchievemnt.user)
  @JoinColumn({
    name: "user_id",
  })
  achievements: UserAchievement[];

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
