import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DateTime } from 'luxon';
import { PrismaService } from '../prisma/prisma.service';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let prismaService: PrismaService;
  let findUniqueMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let findFirstMock: jest.Mock;

  let todoFindUniqueMock: jest.Mock;
  let todoFindFirstMock: jest.Mock;

  const dto = { todoId: 1, description: 'New Task', deadline: new Date() };
  const userId = 1;

  const todo = {
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Great todo',
    userId: 1,
    deletedAt: null,
    tasks: [
      {
        id: 1,
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        completed: false,
      },
    ],
  };

  const existingTask = {
    id: 1,
    ...dto,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    completed: false,
    todo: {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Great todo',
      userId: 1,
      deletedAt: null,
    },
  };

  beforeEach(async () => {
    findUniqueMock = jest.fn();
    createMock = jest.fn();
    updateMock = jest.fn();
    findFirstMock = jest.fn();
    todoFindUniqueMock = jest.fn();
    todoFindFirstMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: PrismaService,
          useValue: {
            todo: {
              findUnique: todoFindUniqueMock,
              findFirst: todoFindFirstMock,
            },
            task: {
              findUnique: findUniqueMock,
              findFirst: findFirstMock,
              create: createMock,
              update: updateMock,
            },
          },
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    prismaService = module.get(PrismaService);

    todoFindUniqueMock.mockResolvedValue(todo);
    findFirstMock.mockResolvedValue(existingTask);
    createMock.mockResolvedValue(existingTask);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });
  describe('createTask', () => {
    it('should create a task and return the transformed data', async () => {
      await expect(service.createTask(userId, dto)).resolves.toEqual(
        expect.objectContaining({
          id: 1,
          description: 'New Task',
          status: 'red',
        }),
      );
    });

    it('should throw ForbiddenException if todo does not belong to user', async () => {
      const userId = 2; // Different user ID

      await expect(service.createTask(userId, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
  describe('getTaskById', () => {
    it('should retrieve a task by ID and return the transformed data', async () => {
      const taskId = 1;
      const todoId = 1;
      const userId = 1;

      await expect(
        service.getTaskById(userId, taskId, todoId),
      ).resolves.toEqual(
        expect.objectContaining({
          id: taskId,
          status: 'red',
        }),
      );
    });

    it('should throw NotFoundException if task is not found', async () => {
      const taskId = 2;
      const todoId = 1;
      const userId = 1;

      await expect(service.getTaskById(userId, taskId, todoId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  describe('editTask', () => {
    const updateDto = { description: 'Updated Task', completed: true }; // Sample DTO for updates
    const taskId = 1;
    const todoId = 1;

    it('should successfully update a task', async () => {
      findUniqueMock.mockResolvedValue(existingTask);
      updateMock.mockResolvedValue({ ...existingTask, ...updateDto });

      await expect(
        service.editTask(userId, taskId, updateDto),
      ).resolves.toEqual(
        expect.objectContaining({
          id: taskId,
          description: 'Updated Task',
          completed: true,
        }),
      );
    });

    it('should throw NotFoundException if the task does not exist', async () => {
      findUniqueMock.mockResolvedValue(null);
      await expect(service.editTask(userId, taskId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if the task does not belong to the user', async () => {
      const otherUserId = 2; // Different user
      const task = { ...updateDto, todo: { id: todoId, userId: otherUserId } };

      findUniqueMock.mockResolvedValue(task);
      await expect(service.editTask(userId, taskId, updateDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
  describe('deleteTaskById', () => {
    const taskId = 1;
    const todoId = 1;

    it('should successfully delete a task', async () => {
      findUniqueMock.mockResolvedValue(existingTask);
      updateMock.mockResolvedValue({ ...existingTask, deletedAt: new Date() });

      await expect(service.deleteTaskById(userId, taskId)).resolves.toEqual(
        expect.objectContaining({ id: taskId, deletedAt: expect.any(Date) }),
      );
    });

    it('should throw NotFoundException if the task does not exist', async () => {
      findUniqueMock.mockResolvedValue(null);
      await expect(service.deleteTaskById(userId, taskId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if the task does not belong to the user', async () => {
      const otherUserId = 2; // Different user
      const task = { id: taskId, todo: { id: todoId, userId: otherUserId } };

      findUniqueMock.mockResolvedValue(task);
      await expect(service.deleteTaskById(userId, taskId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
  describe('dataTransformer', () => {
    it('should assign green status for more than 3 days left', () => {
      const deadline = DateTime.now()
        .setZone('America/New_York')
        .plus({ days: 4 })
        .endOf('day')
        .toJSDate();
      const task = {
        deadline,
      };
      expect(service.dataTransformer(task)).toEqual(
        expect.objectContaining({
          deadline: new Date(deadline),
          status: 'green',
        }),
      );
    });

    it('should assign yellow status for less than 24 hours but more than 3 hours left', () => {
      const deadline = DateTime.now()
        .setZone('America/New_York')
        .plus({ hours: 4 })
        .endOf('day')
        .toJSDate();
      const task = {
        deadline,
      };
      expect(service.dataTransformer(task)).toEqual(
        expect.objectContaining({
          deadline: new Date(deadline),
          status: 'yellow',
        }),
      );
    });

    it('should assign red status for less than 3 hours left', () => {
      const deadline = DateTime.now()
        .setZone('America/New_York')
        .plus({ hours: 2 })
        .toJSDate();
      const task = {
        deadline,
      };
      expect(service.dataTransformer(task)).toEqual(
        expect.objectContaining({
          deadline: new Date(deadline),
          status: 'red',
        }),
      );
    });

    it('should handle past deadlines', () => {
      const deadline = DateTime.now()
        .setZone('America/New_York')
        .minus({ days: 10 })
        .endOf('day')
        .toJSDate();
      const task = {
        deadline,
      };
      expect(service.dataTransformer(task)).toEqual(
        expect.objectContaining({
          deadline: new Date(deadline),
          status: 'red',
        }),
      );
    });
  });
});
