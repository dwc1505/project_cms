import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPasswordHelper } from 'src/helper/util';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Status } from 'src/common/enums/status-active.enum';
import { VerifyEmailDto } from 'src/auth/dto/verify-email.dto';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from 'src/common/constants';
import { generateOtp } from 'src/helper/otp';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) return true;
    return false;
  };
  async create(createUserDto: CreateUserDto) {
    const { name, email, password, phone, address } = createUserDto;
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(`Email ${email} already exists`);
    }

    // define type return of hashPasswordHelper
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      phone,
      address,
    });
    return {
      message: `User created successfully`,
      user,
    };
  }

  async findAll(page: number = DEFAULT_PAGE, limit: number = DEFAULT_PER_PAGE) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.userModel
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateUserDto },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return {
      message: `User updated successfully`,
      updatedUser,
    };
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return deletedUser;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async handleRegister({ name, email, password }: CreateAuthDto) {
    const existing = await this.findByEmail(email);
    if (existing) throw new BadRequestException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOtp();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 5);

    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      status: Status.INACTIVE,
      otp,
      otpExpiresAt,
    });

    return {
      message: 'User registered successfully. Verify your email using OTP.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        status: user.status,
        otp,
      },
    };
  }

  async verifyEmail({ email, otp }: VerifyEmailDto) {
    const user = await this.findByEmail(email);
    if (!user) throw new BadRequestException('Email does not exist');
    if (user.status === Status.ACTIVE)
      throw new BadRequestException('Account already active');

    if (user.otp !== Number(otp)) throw new BadRequestException('Invalid OTP');

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    user.status = Status.ACTIVE;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateProfileDto },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }
}
