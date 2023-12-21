import { IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  readonly title: string;

  readonly category: string;

  @IsNotEmpty()
  readonly content: string;

  readonly thumbnail: string;

  readonly isPublic: boolean;
}
