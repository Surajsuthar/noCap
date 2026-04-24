import z from "zod";
import { getAge } from "./utils";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  first_name: z.string().min(3),
  last_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  confirm_password: z.string().min(8),
  dob: z.string().min(1),
})
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  .refine((data) => {
    const dob = new Date(data.dob);
    return !isNaN(dob.getTime());
  }, {
    message: "Invalid date of birth",
    path: ["dob"],
  })
  .refine((data) => {
    const age = getAge(new Date(data.dob));
    return age >= 18;
  }, {
    message: "You must be at least 18 years old",
    path: ["dob"],
  })
  .transform((data) => {
    const age = getAge(new Date(data.dob));

    return {
      ...data,
      age,
    };
  });
