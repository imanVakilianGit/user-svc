import { user } from '@prisma/client';

import { BaseSuccessResponseInterface } from '../../../../common/interface/base-success-response.interface';

export type UpdateUserProfileResponseType = BaseSuccessResponseInterface & {
    data: user;
};
