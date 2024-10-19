import { user } from '@prisma/client';

import { BaseSuccessResponseInterface } from '../../../../common/interface/base-success-response.interface';

export type CreateUserProfileResponseType = BaseSuccessResponseInterface & {
    data: user;
};
