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

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(nickname: string, password: string) {
    try {
      const user = await this.validateUserCredientials(nickname, password);
      const tokens = await this.getTokens(user.id);
      await this.setCurrentRefreshToken(tokens.refrehToken, user.id);
      return tokens;
    } catch (e) {
      console.error(e);
      if (e instanceof UnauthorizedException) throw e;
      else {
        throw new InternalServerErrorException('알 수 없는 오류');
      }
    }
  }

  async getAccessToken(id: string) {
    try {
      const user = await this.usersRepository.findById(id);
      if (!user) {
        throw new ForbiddenException('접근 권한이 없습니다.');
      }
      const payload = { userId: id };
      const accessToken = await this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: +this.configService.get('JWT_ACCESS_EXPIRATION_TIME'),
      });
      return accessToken;
    } catch (e) {
      console.error(e);
      if (e instanceof ForbiddenException) throw e;
    }
  }

  async getRefreshToken(id: string) {
    try {
      const user = await this.usersRepository.findById(id);
      if (!user) {
        throw new ForbiddenException('접근 권한이 없습니다.');
      }
      const payload = { userId: id };
      const refreshToken = await this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
        expiresIn: 3000,
      });

      return refreshToken;
    } catch (e) {
      console.error(e);
      if (e instanceof ForbiddenException) throw e;
    }
  }

  private async validateUserCredientials(nickname: string, password: string) {
    const user = await this.usersRepository.findByName(nickname);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    } else {
      throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  }

  private async getTokens(id: string) {
    const payload = { userId: id };
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: +this.configService.get('JWT_ACCESS_EXPIRATION_TIME'),
      }),
      this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
        expiresIn: 3000,
      }),
    ]);

    return { accessToken: at, refrehToken: rt };
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
