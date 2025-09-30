import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { permission } from 'process';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() as () =>
        | string
        | null,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') as string, //cannot use this.configService inside super()
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
    };
  }
}
