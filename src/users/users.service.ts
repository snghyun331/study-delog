import * as bcrypt from 'bcryptjs';
import { SALT_ROUND } from 'src/utils/constant';
import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}
  async createUser(nickname: string, password: string, profileImg: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUND);

      const result = await this.saveUser(nickname, hashedPassword, profileImg);
      return result;
    } catch (error) {
      // console.error(error);
      if (error.code === '23505') {
        throw new ConflictException(
          '이 닉네임은 이미 존재합니다. 다른 닉네임을 입력해주세요',
        );
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  private async saveUser(
    nickname: string,
    password: string,
    profileImg: string,
  ) {
    const user = new UserEntity();
    user.nickname = nickname;
    user.password = password;
    user.profileImg = profileImg;
    const result = await this.usersRepository.save(user);
    return result;
  }
}
