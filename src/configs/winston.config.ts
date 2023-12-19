import { utilities, WinstonModule } from 'nest-winston';
import * as winstonDaily from 'winston-daily-rotate-file';
import * as winston from 'winston';

const env = process.env.NODE_ENV;
const logDir = 'src/logs';

const dailyOptions = (level: string) => {
  return {
    level,
    dataPattern: 'YYYY-MM-DD HH:mm:ss',
    dirname: logDir + `${level}`,
    filename: `%DATE%.${level}.log`,
    maxFiles: 10, // 10일치 로그 파일 저장
    zipeedArchive: true,
  };
};

export const winstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: env === 'product' ? 'http' : 'silly',
      format:
        env === 'product'
          ? winston.format.simple()
          : winston.format.combine(
              winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
              }),
              winston.format.colorize(),
              utilities.format.nestLike('Delog', { prettyPrint: true }),
            ),
    }),

    // new winstonDaily(dailyOptions('info')),
    // new winstonDaily(dailyOptions('warn')),
    // new winstonDaily(dailyOptions('error')),
  ],
});
