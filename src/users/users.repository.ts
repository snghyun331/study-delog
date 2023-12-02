import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async createUser({ newUser }) {
    const user = new UserEntity();
    const { nickname, password, profileImg } = newUser;
    user.nickname = nickname;
    user.password = password;
    user.profileImg = profileImg;
    return user;
  }

  async findById(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    return user;
  }

  async findByName(nickname: string) {
    const user = await this.usersRepository.findOne({ where: { nickname } });
    return user;
  }

  async updateFields(id: string, updateFieldsDTO: object) {
    return this.usersRepository.update(id, updateFieldsDTO);
  }
}
