import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Post')
export class PostEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnail: string;

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column({ type: 'boolean', default: true, nullable: false })
  isPublic: boolean;

  @Column({ type: 'int', default: 0, nullable: false })
  views: number;

  @Column({ type: 'int', default: 0, nullable: false })
  commentCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.posts, { nullable: false, eager: true })
  user: UserEntity; // DB에 저장될 때는 자동으로 뒤에 Id가 붙음
}
