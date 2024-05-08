<h1 align="center"> Todolist app </h1> <br>

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Requirements](#requirements)
- [Quickstart](#quick-start)
- [API Documentation](#documentation)

## Introduction

This project is a simple todo list app with it's backend implemented with NestJs framework

## Features

Here are some of the features:

- User Authentication: Implement user authentication using JWT (JSON Web Tokens). Users should be able to register, login, and logout.
- To-Do Lists: Users can create multiple to-do lists. Each to-do list should have a name and a unique identifier.
- Tasks: Users can add tasks to their to-do lists. Each task should have a description, a due date, and a status (e.g., pending, completed).
- CRUD Operations: Implement endpoints for CRUD operations on to-do lists and tasks:

  - Create a new to-do list
  - Retrieve all to-do lists for a user
  - Retrieve a specific to-do list by ID
  - Update a to-do list (e.g., change the name)
  - Delete a to-do list
  - Add a new task to a to-do list
  - Retrieve all tasks for a specific to-do list
  - Retrieve a specific task by ID
  - Update a task (e.g., change description, mark as completed)
  - Indicate the status of the task based on its timeline proximity: if the task has three or more days remaining, - display green; if it has less than 24 hours remaining, display amber (yellow); and if the task is within three hours of the set timeline, display red (danger).
  - Delete a task (Soft delete).

## Tech Stack

- Node
- NestJS
- Express
- Prisma
- MySql
- Docker

## Quick Start

The goal of this quick start is to get a working application quickly up and running:

## Installation

```bash
$ npm install
```

## Running the app

```bash
# Copy the env files
$ cp .env.test .env

# Start the db in docker and migrate prisma
$ db:test:restart

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Testing

```bash
$ npm run test
```

## API Documentation

[Postman API documentation](https://documenter.getpostman.com/view/15213147/2sA3JJAinf)
