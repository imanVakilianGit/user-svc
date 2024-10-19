import { DefaultArgs } from '@prisma/client/runtime/library';
import { Injectable } from '@nestjs/common';
import { user, Prisma } from '@prisma/client';

import { DbPrismaService } from '../db-prisma.service';

@Injectable()
export class ProfileRepository {
    constructor(private readonly prismaService: DbPrismaService) {}

    async create<T extends user>(data: Prisma.userCreateArgs<DefaultArgs>): Promise<T> {
        return (await this.prismaService.user.create(data)) as T;
    }

    async findUnique<T extends user>(data: Prisma.userFindUniqueArgs<DefaultArgs>): Promise<T> {
        return (await this.prismaService.user.findUnique(data)) as T;
    }

    async update<T extends user>(data: Prisma.userUpdateArgs<DefaultArgs>): Promise<T> {
        return (await this.prismaService.user.update(data)) as T;
    }

    async findFirst<T extends user>(data: Prisma.userFindFirstArgs<DefaultArgs>): Promise<T | undefined> {
        return (await this.prismaService.user.findFirst(data)) as T | undefined;
    }
}
