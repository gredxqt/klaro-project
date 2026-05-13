import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AidRequestsModule } from './aid-requests/aid-requests.module';
import { AidRequest } from './aid-requests/entities/aid-request.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',     // 👈 your postgres username
      password: 'root', // 👈 your postgres password
      database: 'klaro_test',     // 👈 your database name
      entities: [AidRequest],
      synchronize: true,        // auto-creates tables in dev, disable in prod
    }),
    AidRequestsModule,
  ],
})
export class AppModule {}