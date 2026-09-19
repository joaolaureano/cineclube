import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { User, Achievement } from ".";

@Entity("user_achievement")
export class UserAchievement {
  @PrimaryColumn()
  user_id: string;

  @PrimaryColumn()
  achievement_id: number;

  @Column()
  current_score: number;

  @ManyToOne(() => User, (user) => user.achievements)
  user: User;

  @ManyToOne(() => Achievement, (achievement) => achievement.users)
  achievement: Achievement;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
