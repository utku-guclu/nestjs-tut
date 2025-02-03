import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UserController {
    // users/me
    @Get('me')
    getMe() {
        return 'get me'
    }
}
