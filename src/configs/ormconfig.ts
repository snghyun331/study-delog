import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

config({ path: `src/configs/env/.dev.env` });
const configService = new ConfigService(); // Create an instance of ConfigService

export default new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PW'),
  database: configService.get<string>('DB_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
  migrationsTableName: 'migrations',
});
