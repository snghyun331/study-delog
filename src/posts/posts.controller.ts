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
  async createNewePost(
    @Body() createPostDto: CreatePostDto,
    @GetUser() userId: string,
  ): Promise<{ message: string }> {
    await this.postsService.createPost(createPostDto, userId);
    return { message: '포스팅을 완료했습니다' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async readMyPosts(@GetUser() userId: string): Promise<{ message: string; result: any }> {
    const result = await this.postsService.getMyPosts(userId);
    return { message: '성공적으로 내 포스트를 가져왔습니다', result };
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
