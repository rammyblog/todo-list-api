import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value === 'string' || value instanceof Date) {
            const date = new Date(value);
            return date.getTime() > new Date().getTime();
          }
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Date cannot be in the past';
        },
      },
    });
  };
}
