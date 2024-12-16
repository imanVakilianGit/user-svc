import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { randomInt } from 'crypto';
import { Prisma, user, users_on_refresh_tokens } from '@prisma/client';

import { AccessAndRefreshTokenInterface } from './common/interface/access-and-refresh-token.interface';
import { AuthenticateUserResponseType } from './common/types/authenticate-response.type';
import { AuthQueryBuilder } from '../db-prisma/query-builders/auth.query-builder';
import { AuthRepository } from '../db-prisma/repositories/auth.repository';
import { AuthenticateUserDto } from './common/dto/authenticate.dto';
import { BaseSuccessResponseInterface } from '../common/interface/base-success-response.interface';
import { CacheService } from '../cache/cache.service';
import { ConfirmLoginUserDto } from './common/dto/confirm-login.dto';
import { CustomJwtService } from '../jwt/jwt.service';
import { ConfirmLoginUserResponseType } from './common/types/confirm-login-response.type';
import { FAILED_USER_REFRESH_TOKEN_EXPIRED } from './responses/error/failed-authenticate.result';
import { FAILED_USER_UNAUTHORIZED } from './responses/error/failed-public.result';
import { FAILED_OTP_NOT_EXPIRED_YET } from './responses/error/failed-login.result';
import { FAILED_INVALID_OTP } from './responses/error/failed-confirm-login.result';
import { JwtPayloadInterface } from '../common/interface/jwt-payload.interface';
import { LoginTypeEnum } from './common/enum/login-type.enum';
import { LogoutUserDto } from './common/dto/logout.dto';
import { omitObject } from '../common/function/omit-object';
import { ProfileQueryBuilder } from '../db-prisma/query-builders/profile.query-builder';
import { ProfileRepository } from '../db-prisma/repositories/profile.repository';
import { SUCCESS_OTP_SENT } from './responses/success/success-login.result';
import { SUCCESS_USER_CONFIRM_LOGIN } from './responses/success/success-confirm-login.result';
import { SUCCESS_USER_LOGOUT } from './responses/success/success-logout.result';
import { SUCCESS_USER_AUTHENTICATE } from './responses/success/success-authenticate.result';
import { UserAgentDto } from './common/dto/user-agent.dto';
import { LoginUserByEmailDto, LoginUserByMobileDto } from './common/dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly authQueryBuilder: AuthQueryBuilder,
        private readonly authRepository: AuthRepository,
        private readonly profileQueryBuilder: ProfileQueryBuilder,
        private readonly profileRepository: ProfileRepository,
        private readonly jwtService: CustomJwtService,
        private readonly cacheService: CacheService,
    ) {}

    async login(dto: LoginUserByEmailDto | LoginUserByMobileDto): Promise<BaseSuccessResponseInterface> {
        try {
            let userProfile: user;

            type OtpSenderArgsType = Parameters<typeof this.sendOtpCodeToMobileNumber | typeof this.sendOtpCodeToEmail>;
            let otpSender: (...args: OtpSenderArgsType) => Promise<boolean>;
            let receiver: string;

            if (dto.type === LoginTypeEnum.MOBILE_NUMBER) {
                userProfile = await this._findOneUserUniqueByFieldOrFail(dto.mobileNumber);

                otpSender = this.sendOtpCodeToMobileNumber;
                receiver = dto.mobileNumber;
            } else if (dto.type === LoginTypeEnum.EMAIL) {
                userProfile = await this._findOneUserUniqueByFieldOrFail(dto.email);

                otpSender = this.sendOtpCodeToEmail;
                receiver = dto.email;
            } else {
                throw new InternalServerErrorException();
            }

            const isExistOtp: boolean = await this.cacheService.isExist(userProfile.id.toString());
            if (isExistOtp) throw new BadRequestException(FAILED_OTP_NOT_EXPIRED_YET);

            const otpCode: string = this._generateOtpCode();

            await this.cacheService.setOrFail(userProfile.id.toString(), otpCode);
            console.log('👽 ~ AuthService ~ login ~ otpCode:', otpCode);

            const sendOtpResult: boolean = await otpSender(receiver, otpCode);
            console.log('👽 ~ AuthService ~ login ~ sendOtpResult:', sendOtpResult);

            return SUCCESS_OTP_SENT;
        } catch (error) {
            throw error;
        }
    }

    async confirmLogin(dto: ConfirmLoginUserDto): Promise<ConfirmLoginUserResponseType> {
        try {
            const userProfile: user = await this._findOneUserUniqueByFieldOrFail(dto.receiver);

            const recordedOtpCode: string | null = await this.cacheService.get(userProfile.id.toString());
            if (!recordedOtpCode || dto.otpCode !== recordedOtpCode) throw new UnauthorizedException(FAILED_INVALID_OTP);

            const tokens: AccessAndRefreshTokenInterface = this._generateAccessAndRefreshToken({ userId: userProfile.id });

            const queryBuilder: Prisma.users_on_refresh_tokensUpsertArgs<DefaultArgs> = this.authQueryBuilder.upsert(
                userProfile.id,
                Object.assign(omitObject(dto, 'otpCode', 'receiver'), { token: tokens.refreshToken }),
            );
            await this.authRepository.upsert(queryBuilder);

            this.cacheService.deleteOrFail(userProfile.id.toString());

            SUCCESS_USER_CONFIRM_LOGIN.data = tokens;
            return <ConfirmLoginUserResponseType>SUCCESS_USER_CONFIRM_LOGIN;
        } catch (error) {
            throw error;
        }
    }

    async logout(dto: LogoutUserDto): Promise<BaseSuccessResponseInterface> {
        try {
            await this._findOneUserByIdOrFail(dto.id);
            const queryBuilder: Prisma.users_on_refresh_tokensDeleteArgs<DefaultArgs> = this.authQueryBuilder.delete(dto.id);
            await this.authRepository.delete(queryBuilder);

            return SUCCESS_USER_LOGOUT;
        } catch (error) {
            throw error;
        }
    }

    async authenticate(dto: AuthenticateUserDto): Promise<AuthenticateUserResponseType> {
        try {
            const validateAccessTokenAndGetPayload: JwtPayloadInterface | undefined = this.jwtService.verifyAccessToken(dto.accessToken);
            if (validateAccessTokenAndGetPayload) {
                const userProfile: user = await this._findOneUserByIdOrFail(validateAccessTokenAndGetPayload.userId);
                SUCCESS_USER_AUTHENTICATE.data = {
                    ...userProfile,
                    ...this._generateAccessAndRefreshToken({ userId: validateAccessTokenAndGetPayload.userId }),
                };
                return <AuthenticateUserResponseType>SUCCESS_USER_AUTHENTICATE;
            }

            const validateRefreshTokenAndGetPayload: JwtPayloadInterface | undefined = this.jwtService.verifyRefreshToken(dto.refreshToken);
            if (!validateRefreshTokenAndGetPayload) throw new UnauthorizedException(FAILED_USER_REFRESH_TOKEN_EXPIRED);

            const userProfile: user = await this._findOneUserByIdOrFail(validateRefreshTokenAndGetPayload.userId);
            await this._findOneRefreshTokenOrFail(Object.assign(omitObject(dto, 'accessToken', 'ip'), validateRefreshTokenAndGetPayload));

            const tokens: AccessAndRefreshTokenInterface = this._generateAccessAndRefreshToken({
                userId: validateRefreshTokenAndGetPayload.userId,
            });

            const queryBuilder: Prisma.users_on_refresh_tokensUpdateArgs<DefaultArgs> = this.authQueryBuilder.update(
                userProfile.id,
                tokens.refreshToken,
            );
            await this.authRepository.update(queryBuilder);

            SUCCESS_USER_AUTHENTICATE.data = {
                ...userProfile,
                ...tokens,
            };
            return <AuthenticateUserResponseType>SUCCESS_USER_AUTHENTICATE;
        } catch (error) {
            throw error;
        }
    }
    // ==================================== private methods ========================================================================
    private async _findOneUserUniqueByFieldOrFail(value: string): Promise<user> {
        const queryBuilder: Prisma.userFindFirstArgs<DefaultArgs> = this.profileQueryBuilder.checkExist(value);
        const databaseResult: user | undefined = await this.profileRepository.findFirst(queryBuilder);
        if (!databaseResult) throw new NotFoundException(FAILED_USER_UNAUTHORIZED);
        return databaseResult;
    }

    private async _findOneUserByIdOrFail(id: number): Promise<user> {
        const queryBuilder: Prisma.userFindUniqueArgs<DefaultArgs> = this.profileQueryBuilder.findUniqueById(id);
        const databaseResult: user | undefined = await this.profileRepository.findUnique(queryBuilder);
        if (!databaseResult) throw new NotFoundException(FAILED_USER_UNAUTHORIZED);
        return databaseResult;
    }

    private async _findOneRefreshTokenOrFail(
        data: Omit<UserAgentDto, 'ip'> & { userId: number; refreshToken: string },
    ): Promise<users_on_refresh_tokens> {
        const queryBuilder: Prisma.users_on_refresh_tokensFindFirstArgs<DefaultArgs> = this.authQueryBuilder.findOneRefreshToken(data);
        const databaseResult: users_on_refresh_tokens | undefined = await this.authRepository.findFirst(queryBuilder);
        if (!databaseResult) throw new UnauthorizedException(FAILED_USER_UNAUTHORIZED);
        return databaseResult;
    }

    private _generateOtpCode(): string {
        return randomInt(10000, 99999).toString();
    }

    async sendOtpCodeToEmail(email: string, otpCode: string) {
        console.log('👽 ~ AuthService ~ sendOtpCodeToEmail ~ sendOtpCodeToEmail:', { email, otpCode });
        // codes...
        return true;
    }

    async sendOtpCodeToMobileNumber(mobileNumber: string, otpCode: string) {
        console.log('👽 ~ AuthService ~ sendOtpCodeToMobileNumber ~ sendOtpCodeToMobileNumber:', { mobileNumber, otpCode });
        // codes...
        return true;
    }

    private _generateAccessAndRefreshToken(payload: JwtPayloadInterface): AccessAndRefreshTokenInterface {
        return {
            accessToken: this.jwtService.generateAccessToken(payload),
            refreshToken: this.jwtService.generateRefreshToken(payload),
        };
    }
}
