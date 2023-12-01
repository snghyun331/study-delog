import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET_KEY'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.headers['authorization']?.slice(7);
    // if (!refreshToken) {
    //   throw new UnauthorizedException('There is no access token in header');
    // }
    // return { refreshToken, ...payload };
    return this.usersService.getUserIfRefreshTokenMatches(refreshToken, payload.userId);
  }
}
