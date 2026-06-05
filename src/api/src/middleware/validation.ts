import { z } from 'zod'
import { Request, Response, NextFunction } from 'express'
import { APIError } from './errorHandler'

// Validation schemas
export const createSessionSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  context: z.string().optional(),
})

export const analyzeSessionSchema = z.object({
  answers: z.record(z.string()).optional().default({}),
})

export const updateSessionSchema = z.object({
  autonomyTarget: z.enum(['L1', 'L2', 'L3', 'L4', 'L5']).optional(),
  capabilities: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        zone: z.enum(['Core', 'Contextual', 'Shared']),
        notes: z.string().optional(),
        flags: z.object({
          repetitive: z.boolean(),
          dataRich: z.boolean(),
          highJudgment: z.boolean(),
          highRisk: z.boolean(),
        }),
      })
    )
    .optional(),
})

export const exportSessionSchema = z.object({
  format: z.enum(['markdown', 'csv', 'json']).optional().default('markdown'),
})

// Validation middleware factory
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body)
      ;(req as any).validatedData = validated
      next()
    } catch (err) {
      if (err instanceof z.ZodError) {
        const issues = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))
        throw new APIError(400, 'Validation error', { issues })
      }
      throw err
    }
  }
}
