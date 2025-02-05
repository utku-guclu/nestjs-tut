import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) { }

    async signin(dto: AuthDto) {
        // find the user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        // if user does not exist, throw an exception
        if (!user) throw new ForbiddenException("Credentials incorrect")

        // compare password
        const pwMatches = await argon.verify(user.hash, dto.password)

        // if password is incorrect, throw an exception
        if (!pwMatches)
            throw new ForbiddenException("Credentials incorrect")

        // send back the user
        // return {
        //     ...user,
        //     hash: undefined
        // }
        return this.signToken(user.id, user.email)
    }

    async signup(dto: AuthDto) {
        // generate the password hash
        const hash = await argon.hash(dto.password)
        // save the new user in the db with id, email and hash
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                },
                // select: {
                //     id: true,
                //     email: true,
                // }
            });

            // return the saved user
            // return {
            //     ...user,
            //     hash: undefined // exclude the hash from the response
            // }
            return this.signToken(user.id, user.email)
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    throw new ForbiddenException("Credentials taken")
                }
            }
            throw error
        }
    }

    async signToken(userId: number, email: string): Promise<{ access_token: string }> {
        // define payload
        const payload = {
            sub: userId,
            email
        }

        // get the secret key
        const secret = this.config.get("JWT_SECRET")

        // sign the token
        const token = await this.jwt.signAsync(payload, {
            expiresIn: "15m",
            secret
        })

        // return the token
        return {
            access_token: token
        }
    }

}