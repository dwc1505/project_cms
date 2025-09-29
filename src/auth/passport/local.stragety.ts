// remove empty lines
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
    // define dto for user
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      // update message to English: 'Invalid email/password'
      throw new UnauthorizedException('Email/Password không hợp lệ');
    }

    switch (user.status) {
      case Status.BANNED:
        //update message to English: 'Account has been banned'
        throw new UnauthorizedException('Tài khoản đã bị khóa');
      case Status.INACTIVE:
        //update message to English: 'Account is not activated'
        throw new UnauthorizedException('Tài khoản chưa được kích hoạt');
      case Status.ACTIVE:
        return user;
      default:
        //update message to English: 'Account status is not valid'
        throw new UnauthorizedException('Trạng thái tài khoản không hợp lệ');
    }
  }
}
