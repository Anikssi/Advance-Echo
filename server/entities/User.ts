import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Story } from "./Story";
import { Comment } from "./Comment";
import { Vote } from "./Vote";

export enum UserRole {
  STORYTELLER = "storyteller",
  SYSTEM_MARSHAL = "system_marshal",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: "varchar", default: UserRole.STORYTELLER })
  role!: UserRole;

  @Column({ default: false })
  isBanned!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Story, (story) => story.user)
  stories!: Story[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes!: Vote[];
}
