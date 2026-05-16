import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Story } from "./Story";

export enum VoteType {
  UPVOTE = "UPVOTE",
  DOWNVOTE = "DOWNVOTE",
}

@Entity()
export class Vote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar" })
  type!: VoteType;

  @ManyToOne(() => User, (user) => user.votes)
  user!: User;

  @ManyToOne(() => Story, (story) => story.votes, { onDelete: "CASCADE" })
  story!: Story;
}
