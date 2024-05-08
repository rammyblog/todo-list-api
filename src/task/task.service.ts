import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  private calculateTimeLeft(deadline: Date) {
    const now = DateTime.now();
    const deadlineDT = DateTime.fromJSDate(deadline);
    const duration = deadlineDT
      .diff(now, ['days', 'hours', 'minutes'])
      .toObject();
    return duration;
  }

  dataTransformer(task) {
    const timeLeft = this.calculateTimeLeft(task.deadline);
    let status = '';
    timeLeft.days = Math.floor(timeLeft.days);
    timeLeft.hours = Math.floor(timeLeft.hours);

    if (timeLeft.days >= 3) {
      status = 'green';
    } else if (timeLeft.days < 1 && timeLeft.hours > 3) {
      status = 'yellow';
    } else if (timeLeft.days < 1 && timeLeft.hours <= 3) {
      status = 'red';
    }

    return { ...task, status };
  }

  async createTask(userId: number, dto: CreateTaskDto) {
    const todo = await this.prisma.todo.findUnique({
      where: {
        id: dto.todoId,
      },
    });

    // check if user owns the todod
    if (!todo || todo.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    const task = await this.prisma.task.create({
      data: {
        todoId: todo.id,
        completed: false,
        ...dto,
      },
      include: {
        todo: true,
      },
    });
    return this.dataTransformer(task);
  }

  async getTaskById(userId: number, taskId: number, todoId: number) {
    const todo = await this.prisma.todo.findUnique({
      where: {
        id: todoId,
      },
      include: {
        tasks: true,
      },
    });

    if (!todo || todo.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    if (todo.tasks.filter(({ id }) => id === taskId).length === 0)
      throw new NotFoundException('Task not part of todo');

    const foundTask = await this.prisma.task.findFirst({
      where: {
        id: taskId,
      },
      include: {
        todo: true,
      },
    });

    if (!foundTask) {
      throw new NotFoundException('Task does not exist');
    }

    return this.dataTransformer(foundTask);
  }

  async editTask(userId: number, taskId: number, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        todo: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task does not exist');
    }

    // check if user owns the todod
    if (task.todo.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    const updatedTask = await this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...dto,
      },
    });
    return this.dataTransformer(updatedTask);
  }

  async deleteTaskById(userId: number, taskId: number) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        todo: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task does not exist');
    }

    // check if user owns the todod
    if (task.todo.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    return this.prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
