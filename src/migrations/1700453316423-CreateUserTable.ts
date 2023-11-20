import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1700453316423 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "User" (id uuid NOT NULL DEFAULT uuid_generate_v4(), nickname varchar NOT NULL, password varchar NOT NULL, profileImg varchar NOT NULL, isBright bool NOT NULL DEFAULT true, isGoogleLogin bool NOT NULL DEFAULT false, isOut bool NOT NULL DEFAULT false, createdAt timestamp NOT NULL DEFAULT now(), updatedAt timestamp NOT NULL DEFAULT now(), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY (id))',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "User"');
  }
}
