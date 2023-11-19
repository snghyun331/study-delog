import { DocumentBuilder } from '@nestjs/swagger';

export class SwaggerConfig {
  public builder = new DocumentBuilder();

  public initializeOptions() {
    return this.builder
      .setTitle('Delog')
      .setDescription('Delog API description')
      .setVersion('1.0')
      .addTag('Users')
      .addTag('Posts')
      .addTag('PostComments')
      .addTag('Bookmarks')
      .addTag('Chats')
      .build();
  }
}
