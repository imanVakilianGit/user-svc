import { BaseFailedResponseInterface } from '../../../common/interface/base-failed-response.interface';

export const FAILED_USER_PROFILE_ALREADY_EXIST: BaseFailedResponseInterface = {
    message: 'profile already exist',
    code: 'FAILED_USER_PROFILE_ALREADY_EXIST',
    field: '',
};

export const FAILED_USER_PROFILE_NOT_FOUND: BaseFailedResponseInterface = {
    message: 'profile not found',
    code: 'FAILED_USER_PROFILE_NOT_FOUND',
};
