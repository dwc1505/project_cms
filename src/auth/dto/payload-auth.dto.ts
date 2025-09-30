export class PayloadAuthDto {
  email: string;
  sub: number;
  role: string;

  constructor(user: any) {
    this.email = user.email;
    this.sub = user.id;
    this.role = user.role;
  }
}
