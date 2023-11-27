import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {
    super({
      // 부모 컴포넌트를 사용하기 위해
      secretOrKey: process.env.JWT_SECRET_KEY, // 토큰 생성했던 것과 같은 키, 토큰이 유효한지 확인
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 클라이언트에서 오는 토큰이 어디서 오는지(AuthHeader, BearerTOekn 타입으로 온다)
    });
  }

  async validate(payload) {
    // 토큰이 유효하다고 생각하면 수행되는 메소드
    const { userId } = payload;
    const user = await this.usersRepository.findOne({ where: { id: userId } }); // 유요한 요청에는 유저의 정보가 들어있끼를 원한다

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
