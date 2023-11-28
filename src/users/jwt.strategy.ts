import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import * as jwt from 'jsonwebtoken';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  async validate(req) {
    try {
      const userToken = req.headers['authorization']?.slice(7);

      if (!userToken) {
        throw new BadRequestException('There is no access token in header');
      }

      const secretKey = process.env.JWT_SECRET_KEY;
      jwt.verify(userToken, secretKey);
      const payload = jwt.decode(userToken);
      const userId = payload['userId'];
      return userId;
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      if (e instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token is expired');
      }
      if (e instanceof SyntaxError) {
        throw new BadRequestException('Invalid JSON object');
      } else {
        throw e;
      }
    }
  }
}

// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { InjectRepository } from '@nestjs/typeorm';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { UserEntity } from './entities/user.entity';
// import { Repository } from 'typeorm';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor() {
//     super({
//       // 부모 컴포넌트를 사용하기 위해
//       secretOrKey: process.env.JWT_SECRET_KEY, // 토큰 생성했던 것과 같은 키, 토큰이 유효한지 확인
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 클라이언트에서 오는 토큰이 어디서 오는지(AuthHeader, BearerTOekn 타입으로 온다)
//       ignoreExpiration: false,
//     });
//   }

//   async validate(payload) {
//     console.log(payload);
//   }
// }
