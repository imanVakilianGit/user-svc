import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { CreateUserProfileDto } from './common/dto/create.dto';
import { CreateUserProfileResponseType } from './common/types/response-types/create-response.type';
import { FindOneUserProfileByIdDto } from './common/dto/find-one-by-id.dto';
import { FindOneUserProfileByIdResponseType } from './common/types/response-types/find-one-by-id-response.type';
import { ProfileService } from './profile.service';
import { UpdateUserProfileDto } from './common/dto/update.dto';
import { UpdateUserProfileResponseType } from './common/types/response-types/update-response.type';

@Controller()
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @MessagePattern('create_user_profile')
    create(@Payload() dto: CreateUserProfileDto): Promise<CreateUserProfileResponseType> {
        return this.profileService.create(dto);
    }

    @MessagePattern('findAllProfile')
    findAll() {
        return this.profileService.findAll();
    }

    @MessagePattern('find_one_user_profile_by_id')
    findOneById(@Payload() dto: FindOneUserProfileByIdDto): Promise<FindOneUserProfileByIdResponseType> {
        return this.profileService.findOneById(dto);
    }

    @MessagePattern('update_user_profile')
    update(@Payload() dto: UpdateUserProfileDto): Promise<UpdateUserProfileResponseType> {
        return this.profileService.update(dto);
    }
}
