import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { DataSource } from 'typeorm';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class PostsService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private dataSource: DataSource,
  ) {}

  async createPost(createUserDto, userId) {
    try {
      const { title, category, content, thumbnail, isPublic } = createUserDto;
      await this.savePostUsingQueryRunner(userId, title, category, content, thumbnail, isPublic);
      return;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException('알 수 없는 오류');
    }
  }

  private async savePostUsingQueryRunner(
    userId: string,
    title: string,
    category: string,
    content: string,
    thumbnail: string,
    isPublic: boolean,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newPost = { userId, title, category, content, thumbnail, isPublic };
      const post = await this.postsRepository.createPost({ newPost });
      await queryRunner.manager.save(post);
      await queryRunner.commitTransaction();
      return;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
