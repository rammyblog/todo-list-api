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
import { CreateTodoDto } from './dto';
import { TodoService } from './todo.service';

@UseGuards(JwtGuard)
@Controller('todos')
export class TodoController {
  constructor(private todoService: TodoService) {}
  @Get()
  getTodos(
    @GetUser('id') userId: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('sortBy') sortBy = 'createdAt',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
    @Query('filterName') filterName?: string,
  ) {
    return this.todoService.getTodoForUser(userId, {
      page,
      pageSize,
      sortBy,
      sortOrder,
      filterName,
    });
  }

  @Get(':id')
  getTodoById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) todoId: number,
  ) {
    return this.todoService.getTodoById(userId, todoId);
  }
  @Post()
  createTodo(@GetUser('id') userId: number, @Body() dto: CreateTodoDto) {
    return this.todoService.createTodo(userId, dto);
  }

  @Patch(':id')
  editTodo(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) todoId: number,
    @Body() dto: CreateTodoDto,
  ) {
    return this.todoService.editTodo(userId, todoId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteTodoById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) todoId: number,
  ) {
    return this.todoService.deleteTodoById(userId, todoId);
  }
}
