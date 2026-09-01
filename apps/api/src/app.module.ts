import { Module } from "@nestjs/common";
import { TsRestModule } from "@ts-rest/nest";
import { ApiController } from "./api.controller";

@Module({
  imports: [
    TsRestModule.register({
      isGlobal: true,
      validateResponses: true,
    }),
  ],
  controllers: [ApiController],
})
export class AppModule {}
