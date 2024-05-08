import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsFutureDate } from './date';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsFutureDate()
  deadline?: Date;

  @IsNotEmpty()
  @IsBoolean()
  completed: boolean;
}
