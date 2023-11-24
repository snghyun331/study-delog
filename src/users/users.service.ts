import * as bcrypt from 'bcryptjs';
import { SALT_ROUND } from 'src/utils/constant';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
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
    const userExist = await this.isUserExists(nickname);
    if (userExist) {
      throw new UnprocessableEntityException('해당 닉네임은 이미 있습니다.');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUND);

    return this.saveUser(nickname, hashedPassword, profileImg);
  }

  private async isUserExists(nickname: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: {
        nickname: nickname,
      },
    });

    return user !== null; // 반환값이 true이면 사용자가 존재, false일 경우 사용자 존재X(null)
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
    await this.usersRepository.save(user);
    return user;
  }
}
