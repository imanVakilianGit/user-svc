import { DefaultArgs } from '@prisma/client/runtime/library';
import { Injectable } from '@nestjs/common';
import { users_on_refresh_tokens, Prisma } from '@prisma/client';

import { DbPrismaService } from '../db-prisma.service';

@Injectable()
export class AuthRepository {
    constructor(private readonly prismaService: DbPrismaService) {}

    async findFirst<T extends users_on_refresh_tokens>(
        data: Prisma.users_on_refresh_tokensFindFirstArgs<DefaultArgs>,
    ): Promise<T | undefined> {
        return (await this.prismaService.users_on_refresh_tokens.findFirst(data)) as T | undefined;
    }

    async upsert<T extends users_on_refresh_tokens>(data: Prisma.users_on_refresh_tokensUpsertArgs<DefaultArgs>): Promise<T> {
        return (await this.prismaService.users_on_refresh_tokens.upsert(data)) as T;
    }

    async delete<T extends users_on_refresh_tokens>(data: Prisma.users_on_refresh_tokensDeleteArgs<DefaultArgs>): Promise<T | undefined> {
        return (await this.prismaService.users_on_refresh_tokens.delete(data)) as T | undefined;
    }

    async update<T extends users_on_refresh_tokens>(data: Prisma.users_on_refresh_tokensUpdateArgs<DefaultArgs>): Promise<T | undefined> {
        return (await this.prismaService.users_on_refresh_tokens.update(data)) as T | undefined;
    }
}
