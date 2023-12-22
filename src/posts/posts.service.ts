import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private postsRepository: PostsRepository,
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

  async getMyPosts(userId) {
    try {
      const posts = await this.postsRepository.findPostsByUserId(userId);
      if (posts.length === 0) {
        throw new NotFoundException('내 포스트가 존재하지 않습니다');
      }
      return posts;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async updatePost(postId, loginUserId, updatePostDto) {
    try {
      const isSameUser = await this.isSameUser(loginUserId, postId);
      if (!isSameUser) {
        throw new UnauthorizedException('포스트 수정 권한이 없습니다.');
      }
      await this.postsRepository.updateFields(postId, updatePostDto);
    } catch (e) {
      this.logger.error(e);
      throw e;
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

  private async isSameUser(loginUserId, postId) {
    const post = await this.postsRepository.findPostByPostId(postId);
    const postWriterId = post.user.id;
    return loginUserId == postWriterId;
  }
}
