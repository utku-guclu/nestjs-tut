import { IsEmail, IsNotEmpty, IsString } from "class-validator";

// dto -> data transfer object
export class AuthDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string
}