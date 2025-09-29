import { IsNotEmpty, IsOptional } from "class-validator";
// in one project please use one style of quotes this ' or this "

// add prettier to formatting code
export class CreateAuthDto {
    @IsNotEmpty()
    email: string

    @IsNotEmpty()
    password: string

    @IsOptional()
    name: string
}
