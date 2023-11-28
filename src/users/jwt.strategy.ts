import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import * as jwt from 'jsonwebtoken';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

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
      console.error(e);
      throw e;
    }
  }
}
