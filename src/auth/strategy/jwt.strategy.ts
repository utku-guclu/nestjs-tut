import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"

@Injectable()
export class JwtStrategy extends PassportStrategy(
    Strategy,
    'jwt'
) {
    constructor(config: ConfigService, private prisma: PrismaService) {
        super({
            jwtFromRequest:
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('JWT_SECRET') ?? 'default_secret'
        })
    }

    // sub: is the id of the user
    async validate(payload: { sub: number, email: string }) {
        // console.log(payload)
        // return {
        //     id: payload.sub,
        //     email: payload.email
        // }
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub
            }
        })
        return {
            ...user,
            hash: undefined
        }
    }
}