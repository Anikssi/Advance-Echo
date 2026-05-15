import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { Category } from "./Category";
import { Comment } from "./Comment";
import { Vote } from "./Vote";

@Entity()
export class Story {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ nullable: true })
  image?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.stories)
  user!: User;

  @ManyToOne(() => Category)
  category!: Category;

  @OneToMany(() => Comment, (comment) => comment.story)
  comments!: Comment[];

  @OneToMany(() => Vote, (vote) => vote.story)
  votes!: Vote[];
}
