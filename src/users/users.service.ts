import * as bcrypt from 'bcryptjs';
import { SALT_ROUND } from 'src/utils/constant';
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  Inject,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private usersRepository: UsersRepository,
    private dataSource: DataSource,
  ) {}

  async createUser(nickname: string, password: string, profileImg: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUND);
      const result = await this.saveUserUsingQueryRunner(nickname, hashedPassword, profileImg);
      return result;
    } catch (e) {
      this.logger.error(e);
      if (e.code === '23505') {
        throw new ConflictException('이 닉네임은 이미 존재합니다. 다른 닉네임을 입력해주세요');
      } else {
        throw new InternalServerErrorException('알 수 없는 오류');
      }
    }
  }

  async getAuthUserInfo(userId: string) {
    try {
      // const user = await this.usersRepository.findOne({ where: { id: userId } });
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('유저가 존재하지 않습니다');
      }
      return user;
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
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
      const newUser = { nickname, password, profileImg };
      const user = await this.usersRepository.createUser({ newUser });
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
