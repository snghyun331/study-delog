import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(PostEntity)
    private postsRepository: Repository<PostEntity>,
  ) {}

  async createPost({ newPost }) {
    const post = new PostEntity();
    const { userId, title, category, content, thumbnail, isPublic } = newPost;
    post.user = userId;
    post.title = title;
    post.category = category;
    post.content = content;
    post.thumbnail = thumbnail;
    post.isPublic = isPublic;
    return post;
  }

  async findByRelation() {
    // 현재 사용자가 작성한 모든 post entity들이 출력
    const allInfo = await this.postsRepository.find({ relations: ['user'] });
    return allInfo;
  }

  async findByPostId(postId) {
    // 현재 사용자가 작성한 모든 post entity들이 출력
    const post = await this.postsRepository.findOne({
      where: { id: postId },
      relations: ['user'],
    });
    return post;
  }
}
