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
      const post = await this.savePostUsingQueryRunner(
        userId,
        title,
        category,
        content,
        thumbnail,
        isPublic,
      );
      const postId = post.id;
      const result = await this.postsRepository.findByPostId(postId);
      return result;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException('알 수 없는 오류');
    }
  }

  async getAll() {
    const result = await this.postsRepository.findByRelation();
    return result;
  }

  async getOne(postId) {
    const result = await this.postsRepository.findOneByPostId(postId);
    return result;
  }

  async getMine(userId) {
    const result = await this.postsRepository.findByUserId(userId);
    return result;
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
      const result = await queryRunner.manager.save(post);
      await queryRunner.commitTransaction();
      return result;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
