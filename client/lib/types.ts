import z from "zod";
import { getAge } from "./utils";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const registerSchema = z
  .object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email address"),
    dob: z.string().min(1, "Date of birth is required"),
  })
  .refine(
    (data) => {
      const dob = new Date(data.dob);
      return !isNaN(dob.getTime());
    },
    {
      message: "Invalid date of birth",
      path: ["dob"],
    },
  )
  .refine(
    (data) => {
      const age = getAge(new Date(data.dob));
      return age >= 18;
    },
    {
      message: "You must be at least 18 years old",
      path: ["dob"],
    },
  )
  .transform((data) => ({
    ...data,
    age: getAge(new Date(data.dob)),
  }));
