import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordHelper } from 'src/helper/util';
import { CreateAuthDto } from './dto/create-auth.dto';
import { PayloadAuthDto } from './dto/payload-auth.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UpdateProfileDto } from 'src/auth/dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    //isValidPassword type boolean
    const isValidPassword = await comparePasswordHelper(
      password,
      user.password,
    );
    if (!isValidPassword) return null;

    return user;
  }

  async login(user: any) {
    const payload = new PayloadAuthDto(user);
    return {
      access_token: this.jwtService.sign({ ...payload }),
      user: payload,
    };
  }

  async handleRegister(registerDto: CreateAuthDto) {
    return await this.usersService.handleRegister(registerDto);
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    return this.usersService.verifyEmail(verifyEmailDto);
  }

  async getProfile(id: string) {
    return this.usersService.findOne(id);
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(id, updateProfileDto);
  }
}
