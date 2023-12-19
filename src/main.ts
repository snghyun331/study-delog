import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common/pipes';
import { SwaggerModule } from '@nestjs/swagger';
import { SwaggerConfig } from './configs/swagger.config';
import { AppModule } from './app.module';
import { SERVER_PORT, SERVER_PORT_2 } from './utils/constant';
import { TransformInterceptor } from './interceptors/response.interceptor';
import { winstonLogger } from './configs/winston.config';
import * as morgan from 'morgan';
const port = SERVER_PORT || SERVER_PORT_2;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  // use global pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // use global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // run swagger
  const config = new SwaggerConfig().initializeOptions();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });

  // app.use(morgan('combined'));  // product
  app.use(morgan('dev')); // dev

  // run server
  try {
    await app.listen(port);
    console.log(`Server is listening on port ${port} successfully`);
  } catch (error) {
    console.error('Failed to start the app server');
  }
}

bootstrap();
