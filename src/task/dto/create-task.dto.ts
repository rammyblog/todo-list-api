import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { IsFutureDate } from './date';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsNotEmpty()
  todoId: number;

  @IsNotEmpty()
  @IsFutureDate()
  deadline: Date;
}
