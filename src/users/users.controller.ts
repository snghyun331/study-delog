import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('USER')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: '유저 회원가입 API' })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation Failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict Error(닉네임 중복)',
  })
  @Post('/signup')
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ message: string; result: any }> {
    const { nickname, password, profileImg } = createUserDto;
    const result = await this.usersService.createUser(
      nickname,
      password,
      profileImg,
    );

    return { message: '회원가입을 완료했습니다.', result };
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
