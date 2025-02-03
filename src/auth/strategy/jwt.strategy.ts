import { ConfigService } from "@nestjs/config"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { Injectable } from "@nestjs/common"

@Injectable()
export class JwtStrategy extends PassportStrategy(
    Strategy,
) {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest:
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('JWT_SECRET') ?? 'default_secret'
        })
    }

    async validate(payload: { sub: number, email: string }) {
        return {
            id: payload.sub,
            email: payload.email
        }
    }
}