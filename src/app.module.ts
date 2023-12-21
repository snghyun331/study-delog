import { Module } from '@nestjs/common';
import { NestConfigModule } from './configs/config.module';
import { DatabaseModule } from './configs/database.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [NestConfigModule, DatabaseModule, UsersModule, PostsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
