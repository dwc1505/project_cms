export class PayloadAuthDto {
  sub: number;
  name: string;
  email: string;
  phone: number;
  address: string;
  roleId: string;
  permissions: { resource: string; permissions: string[] }[];

  constructor(user: any) {
    this.sub = user._id;
    this.name = user.name;
    this.email = user.email;
    this.phone = user.phone;
    this.address = user.address;
    this.roleId = user.roleId;
    this.permissions = user.permissions || [];
  }
}
