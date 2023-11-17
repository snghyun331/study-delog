import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('User')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false }) // 닉네임을 가입 아이디로
  nickname: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'varchar', nullable: false })
  profileImg: string;

  @Column({ type: 'boolean', default: true, nullable: false })
  isBright: boolean;

  @Column({ type: 'boolean', default: false, nullable: false })
  isGoogleLogin: boolean;

  @Column({ type: 'boolean', default: false, nullable: false })
  isOut: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
