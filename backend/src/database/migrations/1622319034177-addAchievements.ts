import { MigrationInterface, QueryRunner } from "typeorm";

export class addAchievements1622319034177 implements MigrationInterface {
  name = "addAchievements1622319034177";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE user_achievement (user_id varchar NOT NULL, achievement_id int NOT NULL, current_score int NOT NULL, created_at timestamp NOT NULL DEFAULT NOW(), updated_at timestamp NOT NULL DEFAULT NOW() , PRIMARY KEY (user_id, achievement_id))"
    );
    await queryRunner.query(
      "CREATE TABLE achievement (id serial, title varchar NOT NULL, description varchar NOT NULL, path_image varchar NOT NULL, target_score int NOT NULL, created_at timestamp NOT NULL DEFAULT NOW(), updated_at timestamp NOT NULL DEFAULT NOW() , tag_id int NULL, PRIMARY KEY (id))"
    );
    await queryRunner.query(
      "ALTER TABLE user_achievement ADD CONSTRAINT FK_2a418515c335cab7c5ba70c28b3 FOREIGN KEY (user_id) REFERENCES app_user(id) "
    );
    await queryRunner.query(
      "ALTER TABLE user_achievement ADD CONSTRAINT FK_843ecd1965f1aac694875674a18 FOREIGN KEY (achievement_id) REFERENCES achievement(id) "
    );
    await queryRunner.query(
      "ALTER TABLE achievement ADD CONSTRAINT FK_7efd7420481a4d3cc3ee6649223 FOREIGN KEY (tag_id) REFERENCES tag(id) "
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE achievement DROP FOREIGN KEY FK_7efd7420481a4d3cc3ee6649223"
    );
    await queryRunner.query(
      "ALTER TABLE user_achievement DROP FOREIGN KEY FK_843ecd1965f1aac694875674a18"
    );
    await queryRunner.query(
      "ALTER TABLE user_achievement DROP FOREIGN KEY FK_2a418515c335cab7c5ba70c28b3"
    );
    await queryRunner.query("DROP TABLE achievement");
    await queryRunner.query("DROP TABLE user_achievement");
  }
}
