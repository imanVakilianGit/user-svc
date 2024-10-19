import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

import { UserAgentDto } from './user-agent.dto';

export class AuthenticateUserDto extends UserAgentDto {
    @IsJWT()
    @IsString()
    @IsNotEmpty()
    accessToken: string;

    @IsJWT()
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}
