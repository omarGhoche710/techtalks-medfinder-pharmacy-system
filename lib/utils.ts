import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    throw new Error(`An error occurred: ${error.message}`);
  } else if (typeof error === "string") {
    throw new Error(`An error occurred: ${error}`);
  } else {
    throw new Error("An unknown error occurred.");
  }
};
