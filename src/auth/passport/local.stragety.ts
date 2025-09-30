import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Status } from 'src/common/enums/status-active.enum';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const messages = {
      [Status.BANNED]: 'This account has been banned',
      [Status.INACTIVE]: 'This account is not activated',
    };

    if (user.status === Status.ACTIVE) {
      return user;
    }

    throw new UnauthorizedException(
      messages[user.status] || 'Invalid account status',
    );
  }
}
