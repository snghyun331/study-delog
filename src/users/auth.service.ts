import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  async login(nickname: string, password: string) {
    try {
      const user = await this.validateUserCredientials(nickname, password);
      const [accessTokenResult, refreshTokenResult] = await Promise.all([
        this.getCookieWithAccessToken(user.id),
        this.getCookieWithRefreshToken(user.id),
      ]);

      const { accessToken, ...accessOption } = accessTokenResult;
      const { refreshToken, ...refreshOption } = refreshTokenResult;

      await this.setCurrentRefreshToken(refreshToken, user.id);
      const result = { accessToken, accessOption, refreshToken, refreshOption };
      return result;
    } catch (e) {
      console.error(e);
      if (e instanceof UnauthorizedException) throw e;
      else {
        throw new InternalServerErrorException('알 수 없는 오류');
      }
    }
  }

  async logout(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.removeRefreshToken(id);
      const result = await this.getCookiesForLogout();
      await queryRunner.commitTransaction();
      return result;
    } catch (e) {
      console.error(e);
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async getCookieWithAccessToken(id: string) {
    try {
      const user = await this.usersRepository.findById(id);
      if (!user) {
        throw new ForbiddenException('접근 권한이 없습니다.');
      }
      const payload = { userId: id };
      const token = await this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: +this.configService.get('JWT_ACCESS_EXPIRATION_TIME'),
      });
      const result = {
        accessToken: token,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: +this.configService.get('JWT_ACCESS_EXPIRATION_TIME') * 1000,
      };
      return result;
    } catch (e) {
      console.error(e);
      if (e instanceof ForbiddenException) throw e;
    }
  }

  async getCookieWithRefreshToken(id: string) {
    try {
      const user = await this.usersRepository.findById(id);
      if (!user) {
        throw new ForbiddenException('접근 권한이 없습니다.');
      }
      const payload = { userId: id };
      const token = await this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
        expiresIn: +this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
      });

      const result = {
        refreshToken: token,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: +this.configService.get('JWT_REFRESH_EXPIRATION_TIME') * 1000,
      };
      return result;
    } catch (e) {
      console.error(e);
      if (e instanceof ForbiddenException) throw e;
    }
  }

  private async getCookiesForLogout() {
    return {
      accessOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
      refreshOption: {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 0,
      },
    };
  }
  private async validateUserCredientials(nickname: string, password: string) {
    const user = await this.usersRepository.findByName(nickname);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    } else {
      throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  }

  private async setCurrentRefreshToken(refreshToken: string, id: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    const updateDto = { hashedRefreshToken };
    return this.usersRepository.updateFields(id, updateDto);
  }

  async removeRefreshToken(id: string) {
    const updateDto = { hashedRefreshToken: null };
    return this.usersRepository.updateFields(id, updateDto);
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    try {
      const user = await this.usersRepository.findById(userId);

      if (!user || !user.hashedRefreshToken) {
        throw new UnauthorizedException('엑세스가 거부되었습니다.');
      }

      const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.hashedRefreshToken);

      if (isRefreshTokenMatching) {
        return user;
      } else {
        throw new UnauthorizedException('Refresh 토큰이 사용자 것과 일치하지 않습니다');
      }
    } catch (e) {
      console.error(e);
      if (e instanceof UnauthorizedException) {
        throw e;
      }
    }
  }
}
