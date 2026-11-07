import { version as uuidVersion, validate as uuidValidate } from "uuid";

export const isValidV4UUID = (str: string | null) => {
  if (!str) return false;
  return uuidValidate(str) && uuidVersion(str) === 4;
};
