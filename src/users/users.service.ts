import * as bcrypt from 'bcryptjs';
import { SALT_ROUND } from 'src/utils/constant';
import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private dataSource: DataSource,
  ) {}
  async createUser(nickname: string, password: string, profileImg: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUND);
      const result = await this.saveUserUsingQueryRunner(nickname, hashedPassword, profileImg);
      return result;
    } catch (e) {
      // console.error(e);
      if (e.code === '23505') {
        throw new ConflictException('이 닉네임은 이미 존재합니다. 다른 닉네임을 입력해주세요');
      } else {
        throw new InternalServerErrorException('알 수 없는 오류');
      }
    }
  }

  private async saveUserUsingQueryRunner(nickname: string, password: string, profileImg: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = new UserEntity();
      user.nickname = nickname;
      user.password = password;
      user.profileImg = profileImg;
      const result = await queryRunner.manager.save(user);
      // throw new InternalServerErrorException(); // 트랜젹션 확인을 위해 일부러 에러를 발생시킴

      await queryRunner.commitTransaction();
      return result;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
