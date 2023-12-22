import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.access.strategy';
import { JwtRefreshStrategy } from './jwt.refresh.strategy';
import { Logger } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), PassportModule, JwtModule.register({})],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, AuthService, JwtStrategy, JwtRefreshStrategy, Logger],
})
export class UsersModule {}
