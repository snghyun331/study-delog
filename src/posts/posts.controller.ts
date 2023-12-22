import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/users/guards/jwt-auth.guard';
import { GetUser } from 'src/utils/decorators/get-user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async create(
    @Body() createPostDto: CreatePostDto,
    @GetUser() userId: string,
  ): Promise<{ message: string; result: any }> {
    const result = await this.postsService.createPost(createPostDto, userId);
    return { message: '포스팅을 완료했습니다', result };
  }

  @Get('/')
  async getAllPosts(): Promise<{ message: string; result: any }> {
    const result = await this.postsService.getAll();
    return { message: '성공적으로 모든 포스트를 불러왔습니다', result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getOwnPost(@GetUser() userId: string): Promise<{ message: string; result: any }> {
    const result = await this.postsService.getMine(userId);
    return { message: 'user성공적으로 가져옴', result };
  }

  @Get('/:postId')
  async getDetail(@Param('postId') postId: string): Promise<{ message: string; result: any }> {
    const result = await this.postsService.getOne(postId);
    return { message: 'ye성공적으로 가져옴', result };
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
  //   return this.postsService.update(+id, updatePostDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.postsService.remove(+id);
  // }
}
