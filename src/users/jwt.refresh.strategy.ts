// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, ExtractJwt } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';
// import { AuthService } from './auth.service';

// @Injectable()
// export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
//   constructor(
//     private configService: ConfigService,
//     private authService: AuthService,
//   ) {
//     super({
//       secretOrKey: configService.get<string>('JWT_REFRESH_SECRET_KEY'),
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       passReqToCallback: true,
//     });
//   }

//   async validate(req: Request, payload: any) {
//     const authorizationHeader = req.headers['authorization'];
//     console.log(authorizationHeader);
//     const refreshToken = req.headers['authorization']?.slice(7);
//     return this.authService.getUserIfRefreshTokenMatches(refreshToken, payload.userId);
//   }
// }

import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super();
  }

  async validate(req: Request) {
    try {
      const refreshToken = req.headers['authorization']?.slice(7);
      if (!refreshToken) {
        throw new BadRequestException('There is no refresh token in header');
      }
      const secretKey = this.configService.get<string>('JWT_REFRESH_SECRET_KEY');
      jwt.verify(refreshToken, secretKey);
      const payload = jwt.decode(refreshToken);
      const userId = payload['userId'];
      return this.authService.getUserIfRefreshTokenMatches(refreshToken, userId);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
