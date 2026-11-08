import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string = "ERROR",
    public details?: unknown,
  ) {
    super(message);
  }
}

export const badRequest = (m: string, details?: unknown) => new ApiError(400, m, "BAD_REQUEST", details);
export const unauthorized = (m = "Требуется авторизация") => new ApiError(401, m, "UNAUTHORIZED");
export const notFound = (m = "Не найдено") => new ApiError(404, m, "NOT_FOUND");
export const conflict = (m: string) => new ApiError(409, m, "CONFLICT");
export const tooMany = (m = "Слишком много запросов") => new ApiError(429, m, "RATE_LIMITED");

/** Единый формат ответа об ошибке: { error: { code, message, details? } } */
export function handleError(e: unknown) {
  if (e instanceof ApiError) {
    return NextResponse.json(
      { error: { code: e.code, message: e.message, details: e.details } },
      { status: e.status },
    );
  }
  if (e instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Проверьте введённые данные", details: e.flatten().fieldErrors } },
      { status: 422 },
    );
  }
  console.error("[api] unexpected error", e);
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "Внутренняя ошибка сервера" } },
    { status: 500 },
  );
}

/** Обёртка для route handlers. */
export function route<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (e) {
      return handleError(e);
    }
  };
}
