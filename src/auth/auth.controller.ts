import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { AuthService } from './auth.service';
import { AuthenticateUserDto } from './common/dto/authenticate.dto';
import { AuthenticateUserResponseType } from './common/types/authenticate-response.type';
import { BaseSuccessResponseInterface } from '../common/interface/base-success-response.interface';
import { ConfirmLoginUserResponseType } from './common/types/confirm-login-response.type';
import { ConfirmLoginUserDto } from './common/dto/confirm-login.dto';
import { LogoutUserDto } from './common/dto/logout.dto';
import { LoginUserByEmailDto, LoginUserByMobileDto } from './common/dto/login.dto';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @MessagePattern('user_login_by_mobile')
    loginByMobile(@Payload() dto: LoginUserByMobileDto): Promise<BaseSuccessResponseInterface> {
        return this.authService.login(dto);
    }

    @MessagePattern('user_login_by_email')
    loginByEmail(@Payload() dto: LoginUserByEmailDto): Promise<BaseSuccessResponseInterface> {
        return this.authService.login(dto);
    }

    @MessagePattern('confirm_login_user')
    confirmLogin(@Payload() dto: ConfirmLoginUserDto): Promise<ConfirmLoginUserResponseType> {
        return this.authService.confirmLogin(dto);
    }

    @MessagePattern('logout_user')
    logout(@Payload() dto: LogoutUserDto): Promise<BaseSuccessResponseInterface> {
        return this.authService.logout(dto);
    }

    @MessagePattern('authenticate_user')
    authenticate(@Payload() dto: AuthenticateUserDto): Promise<AuthenticateUserResponseType> {
        return this.authService.authenticate(dto);
    }
}
