import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator/user.decorator';
import { JwtGuard } from '../auth/guard';
import { CreateTaskDto } from './dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskService } from './task.service';

@UseGuards(JwtGuard)
@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  createTask(@GetUser('id') userId: number, @Body() dto: CreateTaskDto) {
    return this.taskService.createTask(userId, dto);
  }

  @Get(':id')
  getTodoById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) taskId: number,
    @Query('todoId', ParseIntPipe) todoId: number,
  ) {
    return this.taskService.getTaskById(userId, taskId, todoId);
  }

  @Patch(':id')
  editTask(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.taskService.editTask(userId, taskId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteTaskById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) taskId: number,
  ) {
    return this.taskService.deleteTaskById(userId, taskId);
  }
}
