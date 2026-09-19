import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserAchievement, Tag } from ".";

@Entity({ name: "achievement" })
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  path_image: string;

  @Column()
  target_score: number;

  @OneToMany(
    () => UserAchievement,
    (userAchievemnt) => userAchievemnt.achievement
  )
  @JoinColumn({
    name: "achievement_id",
  })
  users: UserAchievement[];

  @ManyToOne(() => Tag, (tag) => tag.achievements, {
    cascade: true,
  })
  @JoinTable({
    name: "achievement_tag",
    joinColumn: {
      name: "achievement",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "tag",
      referencedColumnName: "id",
    },
  })
  tag: Tag;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
