import { z } from 'zod';

// Constants
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

// Helpers
const isoDateTimeRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(?:Z|[+\-]\d{2}:\d{2})$/;
const isValidIsoDateString = (val) => isoDateTimeRegex.test(val) && !Number.isNaN(Date.parse(val));

// Schemas
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createMatchSchema = z
  .object({
    sport: z.string().min(1, 'sport is required'),
    homeTeam: z.string().min(1, 'homeTeam is required'),
    awayTeam: z.string().min(1, 'awayTeam is required'),
    startTime: z
      .string()
      .refine(isValidIsoDateString, { message: 'startTime must be a valid ISO date string' }),
    endTime: z
      .string()
      .refine(isValidIsoDateString, { message: 'endTime must be a valid ISO date string' }),
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((val, ctx) => {
    try {
      const start = new Date(val.startTime);
      const end = new Date(val.endTime);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return; // handled by refine above
      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endTime'],
          message: 'endTime must be after startTime',
        });
      }
    } catch (_) {
      // ignore here; basic validation already handled
    }
  });

export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
