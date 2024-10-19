import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

import { UserAgentDto } from '../../auth/common/dto/user-agent.dto';

export class AuthQueryBuilder {
    findOneRefreshToken(
        data: Omit<UserAgentDto, 'ip'> & { userId: number; refreshToken: string },
    ): Prisma.users_on_refresh_tokensFindFirstArgs<DefaultArgs> {
        return {
            where: {
                user_id: data.userId,
                token: data.refreshToken,
                user_agent: data.userAgent,
                os: data.os,
                browser: data.browser,
            },
        };
    }

    // TODO: update
    upsert(userId: number, data: UserAgentDto & { token: string }): Prisma.users_on_refresh_tokensUpsertArgs<DefaultArgs> {
        return {
            where: {
                user_id: userId,
            },
            create: {
                token: data.token,
                user_agent: data.userAgent,
                os: data.os,
                ip: data.ip,
                browser: data.browser,
                user: { connect: { id: userId } },
            } as Prisma.users_on_refresh_tokensCreateInput,
            update: {
                token: data.token,
                user_agent: data.userAgent,
                os: data.os,
                ip: data.ip,
                browser: data.browser,
            },
        };
    }

    delete(userId: number): Prisma.users_on_refresh_tokensDeleteArgs<DefaultArgs> {
        return {
            where: {
                user_id: userId,
            },
        };
    }

    update(userId: number, refreshToken: string): Prisma.users_on_refresh_tokensUpdateArgs<DefaultArgs> {
        return {
            where: {
                user_id: userId,
            },
            data: {
                token: refreshToken,
            },
        };
    }
}
