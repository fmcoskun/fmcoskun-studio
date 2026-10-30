import { z } from 'zod';
import { SERVICES } from '../../data/services';

export const PROJECT_TYPES: readonly string[] = [...SERVICES.map((s) => s.title), 'Something else'];

// Same schema should be re-applied server-side: client validation is UX, not security.
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your name.')
    .max(100, 'Name must be 100 characters or fewer.'),
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email address.')
    .max(254, 'Email address is too long.')
    .email('Enter a valid email address, e.g. name@company.com.'),
  projectType: z.string().refine((value) => PROJECT_TYPES.includes(value), 'Choose the closest project type.'),
  message: z
    .string()
    .trim()
    .min(20, 'Tell us a little more — at least 20 characters.')
    .max(4000, 'Message must be 4,000 characters or fewer.'),
});

export type ContactData = z.infer<typeof contactSchema>;
export type ContactField = keyof ContactData;
export type FieldErrors = Partial<Record<ContactField, string>>;

export const FIELD_ORDER: readonly ContactField[] = ['name', 'email', 'projectType', 'message'];

export function validate(values: Record<ContactField, string>): { data?: ContactData; errors: FieldErrors } {
  const result = contactSchema.safeParse(values);
  if (result.success) return { data: result.data, errors: {} };
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as ContactField | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { errors };
}
