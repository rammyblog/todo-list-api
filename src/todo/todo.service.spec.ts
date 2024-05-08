import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;
  let prismaService: PrismaService;
  let findUniqueMock: jest.Mock;
  let findManyMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;
  let deleteMock: jest.Mock;

  beforeEach(async () => {
    findUniqueMock = jest.fn();
    findManyMock = jest.fn();
    createMock = jest.fn();
    updateMock = jest.fn();
    deleteMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: PrismaService,
          useValue: {
            todo: {
              findUnique: findUniqueMock,
              findMany: findManyMock,
              create: createMock,
              update: updateMock,
              delete: deleteMock,
            },
          },
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('createTodo', () => {
    it('should create a todo and return the created todo', async () => {
      const dto = { name: 'New Todo' };
      const userId = 1;
      const createdTodo = { id: 1, name: 'New Todo', userId: 1, tasks: [] };
      createMock.mockResolvedValue(createdTodo);

      await expect(service.createTodo(userId, dto)).resolves.toEqual(
        createdTodo,
      );
      expect(createMock).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          userId: userId,
        },
        include: {
          tasks: true,
        },
      });
    });
  });
  describe('getTodoForUser', () => {
    it('should return todos for the user with pagination and filtering', async () => {
      const userId = 1;
      const queryParams = {
        page: 1,
        pageSize: 5,
        sortOrder: 'asc',
        filterName: 'Task',
        sortBy: 'createdAt',
      };
      const todos = [{ id: 1, name: 'Task A', userId: 1 }];
      findManyMock.mockResolvedValue(todos);

      await expect(
        service.getTodoForUser(userId, queryParams),
      ).resolves.toEqual(todos);
      expect(findManyMock).toHaveBeenCalledWith({
        skip: 0,
        take: 5,
        orderBy: { createdAt: 'asc' },
        where: { userId: userId, name: { contains: 'Task' } },
      });
    });
  });
  describe('getTodoById', () => {
    it('should return a specific todo by ID', async () => {
      const userId = 1;
      const todoId = 1;
      const todo = {
        id: todoId,
        name: 'Specific Todo',
        userId: userId,
        tasks: [],
      };
      findUniqueMock.mockResolvedValue(todo);

      await expect(service.getTodoById(userId, todoId)).resolves.toEqual(todo);
      expect(findUniqueMock).toHaveBeenCalledWith({
        where: { id: todoId, userId: userId },
        include: { tasks: true },
      });
    });

    it('should handle not finding a specific todo', async () => {
      const userId = 1;
      const todoId = 1;
      findUniqueMock.mockResolvedValue(null);

      await expect(service.getTodoById(userId, todoId)).resolves.toBeNull();
    });
  });
  describe('editTodo', () => {
    it('should update a todo', async () => {
      const userId = 1;
      const todoId = 1;
      const dto = { name: 'Updated Todo' };
      const updatedTodo = {
        id: todoId,
        name: 'Updated Todo',
        userId: userId,
        tasks: [],
      };
      findUniqueMock.mockResolvedValue(updatedTodo);
      updateMock.mockResolvedValue(updatedTodo);

      await expect(service.editTodo(userId, todoId, dto)).resolves.toEqual(
        updatedTodo,
      );
      expect(updateMock).toHaveBeenCalledWith({
        where: { id: todoId },
        data: dto,
        include: { tasks: true },
      });
    });

    it('should throw ForbiddenException if the todo does not belong to the user', async () => {
      const userId = 1;
      const otherUserId = 2;
      const todoId = 1;
      const dto = { name: 'Updated Todo' };
      findUniqueMock.mockResolvedValue({
        id: todoId,
        userId: otherUserId,
        name: 'Todo',
        tasks: [],
      });

      await expect(service.editTodo(userId, todoId, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
  describe('deleteTodoById', () => {
    it('should delete a todo', async () => {
      const userId = 1;
      const todoId = 1;
      const todo = {
        id: todoId,
        userId: userId,
        name: 'Todo to Delete',
        tasks: [],
      };
      findUniqueMock.mockResolvedValue(todo);
      deleteMock.mockResolvedValue(todo);

      await expect(service.deleteTodoById(userId, todoId)).resolves.toEqual(
        undefined,
      );
      expect(deleteMock).toHaveBeenCalledWith({ where: { id: todoId } });
    });

    it('should throw ForbiddenException if the todo does not belong to the user', async () => {
      const userId = 1;
      const otherUserId = 2;
      const todoId = 1;
      findUniqueMock.mockResolvedValue({
        id: todoId,
        userId: otherUserId,
        name: 'Todo',
        tasks: [],
      });

      await expect(service.deleteTodoById(userId, todoId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
