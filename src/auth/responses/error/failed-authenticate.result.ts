import { BaseFailedResponseInterface } from '../../../common/interface/base-failed-response.interface';

export const FAILED_USER_REFRESH_TOKEN_EXPIRED: BaseFailedResponseInterface = {
    message: 'you need to login at first',
    code: 'FAILED_USER_REFRESH_TOKEN_EXPIRED',
};
