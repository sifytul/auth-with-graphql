import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({
    length: 100,
  })
  name: string;

  @Field(() => String)
  @Column()
  email: string;

  @Column("text")
  password: string;

  @Field(() => Int)
  @Column("int", { default: 0 })
  tokenVersion: number;

  @Field(() => Boolean)
  @Column("bool", { default: false })
  isAdmin: boolean;
}
