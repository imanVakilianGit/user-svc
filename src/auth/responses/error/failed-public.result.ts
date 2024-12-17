import { BaseFailedResponseInterface } from '../../../common/interface/base-failed-response.interface';

export const FAILED_USER_UNAUTHORIZED: BaseFailedResponseInterface = {
    message: 'need to register or login at first',
    code: 'FAILED_USER_UNAUTHORIZED',
};
