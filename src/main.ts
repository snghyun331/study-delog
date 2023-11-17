import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SERVER_PORT, SERVER_PORT_2 } from './utils/constant';

const port = SERVER_PORT || SERVER_PORT_2;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  try {
    await app.listen(port);
    console.log(`Server is listening on port ${port} successfully`);
  } catch (error) {
    console.error('Failed to start the app server');
  }
}

bootstrap();
