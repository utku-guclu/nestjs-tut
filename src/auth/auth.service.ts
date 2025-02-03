import { ForbiddenException, Injectable } from "@nestjs/common";
import { User, Bookmark } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

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
        return {
            ...user,
            hash: undefined
        }
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
            return {
                ...user,
                hash: undefined // exclude the hash from the response
            }
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    throw new ForbiddenException("Credentials taken")
                }
            }
            throw error
        }
    }
}