import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.access.strategy';
import { JwtRefreshStrategy } from './jwt.refresh.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule,
    JwtModule.register({}),
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     secret: configService.get<string>('JWT_SECRET_KEY'),
    //     signOptions: {
    //       expiresIn: configService.get<number>('JWT_ACCESS_EXPIRATION_TIME'),
    //       // expiresIn: 3600,
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, JwtRefreshStrategy],
  exports: [JwtStrategy, JwtRefreshStrategy, PassportModule],
})
export class UsersModule {}
