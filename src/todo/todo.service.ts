import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}
  async createTodo(userId: number, dto: CreateTodoDto) {
    const todo = await this.prisma.todo.create({
      data: {
        name: dto.name,
        userId: userId,
      },
      include: {
        tasks: true,
      },
    });

    return todo;
  }

  async getTodoForUser(
    userId: number,
    queryParams: {
      page: number;
      pageSize: number;
      sortBy: string;
      sortOrder: string;
      filterName?: string;
    },
  ) {
    const { page, pageSize, sortBy, sortOrder, filterName } = queryParams;

    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const orderBy = {
      [sortBy]: sortOrder,
    };

    const where: Prisma.TodoWhereInput = {
      userId,
    };
    if (filterName) {
      where.name = { contains: filterName };
    }

    return this.prisma.todo.findMany({
      skip,
      take,
      orderBy,
      where,
    });
  }

  async getTodoById(userId: number, todoId: number) {
    const todo = await this.prisma.todo.findUnique({
      where: {
        id: todoId,
        userId,
      },
      include: {
        tasks: true,
      },
    });

    console.log(todo);

    if (!todo) {
      throw new NotFoundException('Not Found');
    }

    return todo;
  }

  async editTodo(userId: number, todoId: number, dto: CreateTodoDto) {
    const todo = await this.prisma.todo.findUnique({
      where: {
        id: todoId,
      },
      include: {
        tasks: true,
      },
    });

    // check if user owns the todod
    if (!todo || todo.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    return this.prisma.todo.update({
      where: {
        id: todoId,
      },
      data: {
        ...dto,
      },
      include: {
        tasks: true,
      },
    });
  }

  async deleteTodoById(userId: number, todoId: number) {
    const todo = await this.prisma.todo.findUnique({
      where: {
        id: todoId,
      },
    });

    // check if user owns the todo
    if (!todo || todo.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    await this.prisma.todo.delete({
      where: {
        id: todoId,
      },
    });
  }
}
