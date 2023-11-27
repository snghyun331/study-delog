import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly nickname: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly password: string;
}
