import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/signup')
  async create(@Body() createUserDto: CreateUserDto): Promise<void> {
    const { nickname, password, profileImg } = createUserDto;
    const savedUser = await this.usersService.createUser(
      nickname,
      password,
      profileImg,
    );
    return Object.assign({
      statusCode: 201,
      message: '회원가입이 완료되었습니다.',
      data: savedUser,
    });
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
