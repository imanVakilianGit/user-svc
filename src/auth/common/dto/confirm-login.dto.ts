import { IsNotEmpty, IsString, Length } from 'class-validator';

import { UserAgentDto } from './user-agent.dto';

export class ConfirmLoginUserDto extends UserAgentDto {
    @Length(5, 5)
    @IsString()
    @IsNotEmpty()
    otpCode: string;

    @IsString()
    @IsNotEmpty()
    receiver: string;
}
