import { BaseFailedResponseInterface } from '../../../common/interface/base-failed-response.interface';

export const FAILED_USER_UNAUTHORIZED: BaseFailedResponseInterface = {
    message: 'need to login',
    code: 'FAILED_USER_UNAUTHORIZED',
};
