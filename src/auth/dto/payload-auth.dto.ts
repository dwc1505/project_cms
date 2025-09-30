export class PayloadAuthDto {
  email: string;
  sub: number;
  role: string;
  permissions: { resource: string; permissions: string[] }[];

  constructor(user: any) {
    this.email = user.email;
    this.sub = user.id;
    this.role = user.role;
    this.permissions = user.permissions || [];
  }
}
