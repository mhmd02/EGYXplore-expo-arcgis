import { z } from "zod";

// Optional numeric fields come from text inputs, so "" means "not provided"
// rather than 0. Ranges mirror the backend's TripBuilderVM annotations.
const optionalNumber = (message) =>
  z
    .union([z.literal(""), z.coerce.number()])
    .optional()
    .transform((value) =>
      value === "" || value === undefined ? undefined : value,
    )
    .refine((value) => value === undefined || !Number.isNaN(value), {
      message,
    });

export const tripSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Trip name is required")
      .max(100, "Trip name is too long"),
    budget: optionalNumber("Enter a valid budget").refine(
      (value) => value === undefined || value >= 0,
      { message: "Budget must be a positive amount" },
    ),
    companions: optionalNumber("Enter a valid number of companions")
      .refine((value) => value === undefined || Number.isInteger(value), {
        message: "Companions must be a whole number",
      })
      .refine((value) => value === undefined || (value >= 1 && value <= 100), {
        message: "Companions must be between 1 and 100",
      }),
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine(
    (data) => stripTime(data.endDate) >= stripTime(data.startDate),
    {
      message: "End date must be on or after the start date",
      path: ["endDate"],
    },
  );

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}
