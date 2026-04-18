import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const registerSchema = z.object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

export const onboardingSchema = z.object({
    username: z.string().min(3, "Username phải có ít nhất 3 ký tự"),
    birthday: z.string().optional(),
    province: z.string().optional(),
    className: z.string().optional(),
    school: z.string().optional(),
    bio: z.string().max(500, "Bio không được vượt quá 500 ký tự").optional(),
});

export const createCourseSchema = z.object({
    title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
    description: z.string().min(20, "Mô tả phải có ít nhất 20 ký tự"),
    subject: z.enum(["programming", "ai", "office", "highschool", "other"]),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    price: z.number().min(0),
    isFree: z.boolean(),
});

export const createPostSchema = z.object({
    title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
    content: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
    type: z.enum(["explore", "info"]),
    tags: z.array(z.string()).optional(),
});

export const createCommentSchema = z.object({
    content: z.string().min(1, "Nội dung bình luận không được để trống"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
export type CreateCourseFormValues = z.infer<typeof createCourseSchema>;
export type CreatePostFormValues = z.infer<typeof createPostSchema>;
export type CreateCommentFormValues = z.infer<typeof createCommentSchema>;