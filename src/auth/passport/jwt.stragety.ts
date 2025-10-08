import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayloadAuthDto } from '../dto/payload-auth.dto';

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

  async validate(payload: PayloadAuthDto) {
    return payload;
  }
}
