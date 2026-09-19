import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { Tag, User } from ".";

@Entity("user_tag")
export class UserTag {
  @PrimaryColumn()
  user_id: string;

  @PrimaryColumn()
  tag_id: number;

  @Column()
  total_point: number;

  @ManyToOne(() => User, (user) => user.user_tags)
  user: User;

  @ManyToOne(() => Tag, (tag) => tag.user_tags)
  tag: Tag;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
