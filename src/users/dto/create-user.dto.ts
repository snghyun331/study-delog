import {
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: '최소 2자 최대 10자',
  })
  @IsNotEmpty({ message: '닉네임은 필수 항목입니다' })
  @IsString()
  @MinLength(2, { message: '닉네임은 최소 2자 이상이어야 합니다.' })
  @MaxLength(10, { message: '닉네임은 최대 10자 이하이어야 합니다.' })
  @Matches(/^\S+$/, { message: '닉네임에는 공백이 포함될 수 없습니다.' })
  readonly nickname: string;

  @ApiProperty({
    description: '비밀번호(8자이상)',
  })
  @IsNotEmpty({ message: '비밀번호는 필수 항목입니다' })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다' })
  @Matches(/^[A-Za-z\d!@#$%^&*()]*$/, {
    message:
      '비밀번호는 영문자, 숫자, 특수문자(!@#$%^&*())만 포함할 수 있고, 공백을 포함할 수 없습니다.',
  })
  readonly password: string;

  @ApiProperty({
    description: '프로필 이미지',
  })
  @IsNotEmpty()
  readonly profileImg: string;
}
