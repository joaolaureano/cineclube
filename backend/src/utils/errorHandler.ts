import { Response, Request, NextFunction } from "express";
import { ValidateError } from "tsoa";

//o quarto parâmetro é o que faz o express reconhecer isto como error handler,
//mesmo sem ser usado
export function errorhandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (err instanceof ValidateError) {
    return res.status(err.status).json({ ...err, success: false });
  }

  if (err instanceof Error) {
    return res.status(500).json({
      message: "Internal Server Error",
      errorMessage: err.message,
      success: false,
    });
  }

  //um valor lançado que não é Error ainda precisa virar resposta, senão a
  //requisição fica pendurada
  return res.status(500).json({
    message: "Internal Server Error",
    success: false,
  });
}
