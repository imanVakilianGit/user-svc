import { gender_enum, Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

import { CreateUserProfileDto } from '../../profile/common/dto/create.dto';
import { UpdateUserProfileDto } from '../../profile/common/dto/update.dto';

export class ProfileQueryBuilder {
    create(data: CreateUserProfileDto): Prisma.userCreateArgs<DefaultArgs> {
        return {
            data: {
                national_code: data.nationalCode,
                mobile_number: data.mobileNumber,
                email: data.email,
                first_name: data.firstName,
                last_name: data.lastName,
                gender: data.gender as gender_enum,
                birth_date: data.birthDate,
            },
        };
    }

    findUniqueById(id: number): Prisma.userFindUniqueArgs<DefaultArgs> {
        return {
            where: {
                id,
            },
        };
    }

    update(data: UpdateUserProfileDto): Prisma.userUpdateArgs<DefaultArgs> {
        return {
            where: {
                id: data.id,
            },
            data: {
                first_name: data.firstName,
                last_name: data.lastName,
                birth_date: data.birthDate,
            },
        };
    }

    checkExist(value: string): Prisma.userFindFirstArgs<DefaultArgs> {
        return {
            where: {
                OR: [{ mobile_number: value }, { email: value }],
            },
        };
    }
}
