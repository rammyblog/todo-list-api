import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL'),
        },
      },
    });

    this.$use(async (params, next) => {
      const actions = ['create', 'update'];
      if (
        params.model &&
        !params.args.where?.deletedAt &&
        !actions.includes(params.action)
      ) {
        if (!params.args.where) {
          params.args.where = {};
        }
        // Append `deletedAt` is null to all queries
        params.args.where.deletedAt = null;
      }

      return next(params);
    });
  }

  cleanDb() {
    return this.$transaction([this.todo.deleteMany(), this.user.deleteMany()]);
  }
}
