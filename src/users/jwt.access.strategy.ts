import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(private configService: ConfigService) {
    super();
  }
  async validate(req: Request) {
    try {
      const userToken = req.headers['authorization']?.slice(7);

      if (!userToken) {
        throw new BadRequestException('There is no access token in header');
      }

      const secretKey = this.configService.get<string>('JWT_SECRET_KEY');
      const payload = jwt.verify(userToken, secretKey);
      const userId = payload['userId'];
      return userId;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
