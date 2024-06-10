import { FieldError } from "react-hook-form";

export const getFieldError = (fieldError?: FieldError | any) => {
  return fieldError?.message;
};
