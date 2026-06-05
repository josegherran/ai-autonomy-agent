import { Request, Response, NextFunction } from 'express'

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[ERROR]', err)

  if (err instanceof APIError) {
    res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode,
      details: err.details || undefined,
    })
    return
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: 'Invalid JSON',
      status: 400,
    })
    return
  }

  res.status(500).json({
    error: 'Internal server error',
    status: 500,
  })
}
