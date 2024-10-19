import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { Prisma, user } from '@prisma/client';

import { CreateUserProfileResponseType } from './common/types/response-types/create-response.type';
import { CreateUserProfileDto } from './common/dto/create.dto';
import { FindOneUserProfileByIdResponseType } from './common/types/response-types/find-one-by-id-response.type';
import { FindOneUserProfileByIdDto } from './common/dto/find-one-by-id.dto';
import { ProfileRepository } from '../db-prisma/repositories/profile.repository';
import { ProfileQueryBuilder } from '../db-prisma/query-builders/profile.query-builder';
import { SUCCESS_CREATE_USER_PROFILE } from './responses/success/success-create.result';
import { SUCCESS_FIND_ONE_USER_PROFILE_BY_ID } from './responses/success/success-find-one-by-id.result';
import { SUCCESS_UPDATE_USER_PROFILE } from './responses/success/success-update.result';
import { UpdateUserProfileDto } from './common/dto/update.dto';
import { UpdateUserProfileResponseType } from './common/types/response-types/update-response.type';
import { FAILED_USER_PROFILE_ALREADY_EXIST, FAILED_USER_PROFILE_NOT_FOUND } from './responses/error/failed-public.result';

@Injectable()
export class ProfileService {
    constructor(
        private readonly profileRepository: ProfileRepository,
        private readonly profileQueryBuilder: ProfileQueryBuilder,
    ) {}
    async create(dto: CreateUserProfileDto): Promise<CreateUserProfileResponseType> {
        try {
            const queryBuilder: Prisma.userCreateArgs<DefaultArgs> = this.profileQueryBuilder.create(dto);
            const databaseResult: user = await this.profileRepository.create(queryBuilder);

            SUCCESS_CREATE_USER_PROFILE.data = databaseResult;
            return <CreateUserProfileResponseType>SUCCESS_CREATE_USER_PROFILE;
        } catch (error) {
            if (error.code === 'P2002' && error.meta.target) {
                FAILED_USER_PROFILE_ALREADY_EXIST.field = error.meta.target;
                throw new ConflictException(FAILED_USER_PROFILE_ALREADY_EXIST);
            }
            throw error;
        }
    }

    findAll() {
        return `This action returns all profile`;
    }

    async findOneById(dto: FindOneUserProfileByIdDto): Promise<FindOneUserProfileByIdResponseType> {
        try {
            const userProfile: user = await this._findOneByIdOrFail(dto.id);
            SUCCESS_FIND_ONE_USER_PROFILE_BY_ID.data = userProfile;
            return <FindOneUserProfileByIdResponseType>SUCCESS_FIND_ONE_USER_PROFILE_BY_ID;
        } catch (error) {
            throw error;
        }
    }

    async update(dto: UpdateUserProfileDto): Promise<UpdateUserProfileResponseType> {
        try {
            await this._findOneByIdOrFail(dto.id);
            const queryBuilder: Prisma.userUpdateArgs<DefaultArgs> = this.profileQueryBuilder.update(dto);
            const databaseResult: user = await this.profileRepository.update(queryBuilder);
            SUCCESS_UPDATE_USER_PROFILE.data = databaseResult;
            return <UpdateUserProfileResponseType>SUCCESS_UPDATE_USER_PROFILE;
        } catch (error) {
            throw error;
        }
    }

    remove(id: number) {
        return `This action removes a #${id} profile`;
    }

    private async _findOneByIdOrFail(id: number): Promise<user> {
        const queryBuilder: Prisma.userFindUniqueArgs<DefaultArgs> = this.profileQueryBuilder.findUniqueById(id);
        const databaseResult: user = await this.profileRepository.findUnique(queryBuilder);
        if (!databaseResult) throw new NotFoundException(FAILED_USER_PROFILE_NOT_FOUND);
        return databaseResult;
    }
}
