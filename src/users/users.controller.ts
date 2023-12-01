import { Controller, Post, Request, Get, Body, HttpCode, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './authguards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './authguards/jwt-refresh.auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserLoginDto } from './dto/user-login.dto';
import { AuthService } from 'src/auth/auth.service';

@ApiTags('USER')
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @ApiOperation({ summary: '유저 회원가입 API' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 400, description: 'Validation Failed' })
  @ApiResponse({ status: 409, description: 'Conflict Error(닉네임 중복)' })
  @Post('/signup')
  async create(@Body() createUserDto: CreateUserDto): Promise<{ message: string; result: any }> {
    const { nickname, password, profileImg } = createUserDto;
    const result = await this.usersService.createUser(nickname, password, profileImg);

    return { message: '회원가입을 완료했습니다.', result };
  }

  @ApiOperation({ summary: '유저 로그인 API' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '로그인 실패(아이디 혹은 비번 불일치)' })
  @HttpCode(200)
  @Post('/signin')
  async login(@Body() userLoginDto: UserLoginDto): Promise<{ message: string; result: any }> {
    const { nickname, password } = userLoginDto;
    const result = await this.usersService.userLogin(nickname, password);

    return { message: '로그인 성공했습니다.', result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getAuthUserInfo(@Request() req): Promise<{ message: string; result: any }> {
    const result = await this.usersService.getAuthUserInfo(req.user);
    return { message: '당신의 정보를 성공적으로 가져왔습니다.', result };
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Get('/refresh')
  async refresh(@Request() req): Promise<{ message: string; result: any }> {
    const accessToken = await this.authService.getAccessToken(req.user.id);
    const result = { accessToken };
    return { message: '성공적으로 access 토큰이 갱신되었습니다', result };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('/logout')
  async logOut(@Request() req): Promise<{ message: string }> {
    await this.authService.removeRefreshToken(req.user);
    return { message: '성공적으로 로그아웃 되었습니다.' };
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
