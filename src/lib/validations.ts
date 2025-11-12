import { z } from 'zod';

// Company validation schema
export const companySchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Company name is required")
    .max(255, "Company name must be less than 255 characters"),
  company_description: z.string()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .or(z.literal('')),
  company_value: z.string()
    .max(500, "Company value must be less than 500 characters")
    .optional()
    .or(z.literal('')),
  company_logo_url: z.string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal('')),
  company_base_url: z.string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal('')),
});

export type CompanyFormData = z.infer<typeof companySchema>;

// Vacancy validation schema
export const vacancySchema = z.object({
  title: z.string()
    .trim()
    .min(1, "Job title is required")
    .max(255, "Job title must be less than 255 characters"),
  company_uuid: z.string()
    .uuid("Please select a valid company"),
  description: z.string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .or(z.literal('')),
  vacancy_location: z.string()
    .max(255, "Location must be less than 255 characters")
    .optional()
    .or(z.literal('')),
  vacancy_requirement: z.string()
    .max(5000, "Requirements must be less than 5000 characters")
    .optional()
    .or(z.literal('')),
  vacancy_type: z.string()
    .optional()
    .or(z.literal('')),
  salary_min: z.number()
    .int("Salary must be a whole number")
    .positive("Salary must be positive")
    .optional(),
  salary_max: z.number()
    .int("Salary must be a whole number")
    .positive("Salary must be positive")
    .optional(),
  search_url: z.string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    if (data.salary_min && data.salary_max) {
      return data.salary_max >= data.salary_min;
    }
    return true;
  },
  {
    message: "Maximum salary must be greater than or equal to minimum salary",
    path: ["salary_max"],
  }
);

export type VacancyFormData = z.infer<typeof vacancySchema>;

// Interview schedule validation schema
export const interviewScheduleSchema = z.object({
  vacancy_uuid: z.string()
    .uuid("Please select a valid vacancy"),
  company_uuid: z.string()
    .uuid("Please select a valid company"),
  candidate_name: z.string()
    .trim()
    .min(1, "Candidate name is required")
    .max(255, "Candidate name must be less than 255 characters"),
  interview_date: z.string()
    .min(1, "Interview date is required")
    .refine(
      (date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      },
      { message: "Interview date cannot be in the past" }
    ),
  interview_time: z.string()
    .min(1, "Interview time is required")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter a valid time"),
  interview_location: z.string()
    .max(500, "Location must be less than 500 characters")
    .optional()
    .or(z.literal('')),
  interview_type: z.string()
    .optional()
    .or(z.literal('')),
  interviewer_name: z.string()
    .max(255, "Interviewer name must be less than 255 characters")
    .optional()
    .or(z.literal('')),
  meeting_link: z.string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal('')),
  status: z.string()
    .optional()
    .or(z.literal('')),
});

export type InterviewScheduleFormData = z.infer<typeof interviewScheduleSchema>;

// Authentication validation schemas
export const loginSchema = z.object({
  email: z.string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type SignupFormData = z.infer<typeof signupSchema>;
