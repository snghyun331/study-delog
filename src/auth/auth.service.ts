import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(nickname: string, password: string) {
    try {
      const user = await this.usersRepository.findOne({ where: { nickname } });
      if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = await this.getAccessToken(user.id);
        const refreshToken = await this.getRefreshToken(user.id);
        await this.setCurrentRefreshToken(refreshToken, user.id);
        const result = { accessToken, refreshToken };
        return result;
      } else {
        throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (e) {
      console.error(e);
      if (e instanceof UnauthorizedException) {
        throw e; // UnauthorizedException은 그대로 던지기
      } else {
        throw new InternalServerErrorException('알 수 없는 오류');
      }
    }
  }

  async getAccessToken(id: string) {
    const payload = { userId: id };
    const accessToken = await this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET_KEY'),
      // expiresIn: Number(this.configService.get('JWT_ACCESS_EXPIRATION_TIME')),
      expiresIn: +this.configService.get('JWT_ACCESS_EXPIRATION_TIME'),
    });
    return accessToken;
  }

  async getRefreshToken(id: string) {
    const payload = { userId: id };
    const refreshToken = await this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
      // expiresIn: this.configService.get<number>('JWT_REFRESH_EXPIRATION_TIME'),
      expiresIn: 3000,
    });

    return refreshToken;
  }

  private async setCurrentRefreshToken(refreshToken: string, id: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(id, { hashedRefreshToken });
  }

  async removeRefreshToken(id: string) {
    return this.usersRepository.update(id, { hashedRefreshToken: null });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    // user이 null일때
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access Denied');
    }
    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.hashedRefreshToken);

    if (isRefreshTokenMatching) {
      return user;
    } else {
      throw new UnauthorizedException('Not Match');
    }
  }
}
