export class PayloadAuthDto {
  sub: number;
  name: string;
  email: string;
  phone: number;
  address: string;
  role: string;
  permissions: { resource: string; permissions: string[] }[];

  constructor(user: any) {
    this.sub = user.id;
    this.name = user.name;
    this.email = user.email;
    this.phone = user.phone;
    this.address = user.address;
    this.role = user.role;
    this.permissions = user.permissions || [];
  }
}
