import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPasswordHelper } from 'src/helper/util';
import { UpdateUserDto } from './dto/update-user.dto';

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
      // update message
      throw new BadRequestException(`Email ${email} đã tồn tại`);
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
      // update message
      message: `Thêm thành công user`,
      user,
    };
  }

  async findAll() {
    const users = await this.userModel.find();
    return users;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      // update message
      throw new NotFoundException(`Không tìm thấy user chứa id ${id}`);
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      // update message
      throw new NotFoundException(`Không tìm thấy user chứa id ${id}`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Không tìm thấy user chứa id ${id}`);
    }

    // why we need to declare this const
    const fieldsToUpdate = updateUserDto;
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { $set: fieldsToUpdate },
      { new: true },
    );

    if (!updatedUser) {
      //update message
      throw new NotFoundException(`Không tìm thấy user chứa id ${id}`);
    }

    return {
      //update message
      message: `Sửa thành công user`,
      updatedUser,
    };
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      //update message
      throw new NotFoundException(`Không tìm thấy user chứa id ${id}`);
    }
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    if (!deletedUser) {
      //update message
      throw new NotFoundException(`Không tìm thấy user chứa id ${id}`);
    }
    return deletedUser;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { name, email, password } = registerDto;
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(
        //update message
        `Email ${email} đã tồn tại.Vui lòng sử dụng email khác`,
      );
    }
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
    });
    return {
      //update message
      message: `Đăng ký thành công`,
      user,
    };
  }
}
