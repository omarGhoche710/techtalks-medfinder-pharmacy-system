import { NextResponse } from "next/server";

// ============================================
// TYPES
// ============================================

type ValidationRule = {
  required?: boolean;
  type?: "string" | "number" | "boolean";
  min?: number;
  max?: number;
  enum?: string[];
};

type ValidationSchema = Record<string, ValidationRule>;

// ============================================
// VALIDATOR
// ============================================

export function validate(
  data: Record<string, unknown>,
  schema: ValidationSchema,
): { valid: boolean; error: string | null } {
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Required check
    if (rules.required && (value === undefined || value === null || value === "")) {
      return { valid: false, error: `${field} is required.` };
    }

    // Skip further checks if field is not provided and not required
    if (value === undefined || value === null) continue;

    // Type check
    if (rules.type === "number") {
      const num = Number(value);
      if (Number.isNaN(num)) {
        return { valid: false, error: `${field} must be a number.` };
      }
      if (rules.min !== undefined && num < rules.min) {
        return { valid: false, error: `${field} must be at least ${rules.min}.` };
      }
      if (rules.max !== undefined && num > rules.max) {
        return { valid: false, error: `${field} must be at most ${rules.max}.` };
      }
    }

    if (rules.type === "string") {
      if (typeof value !== "string") {
        return { valid: false, error: `${field} must be a string.` };
      }
      if (rules.min !== undefined && value.length < rules.min) {
        return { valid: false, error: `${field} must be at least ${rules.min} characters.` };
      }
      if (rules.max !== undefined && value.length > rules.max) {
        return { valid: false, error: `${field} must be at most ${rules.max} characters.` };
      }
    }

    // Enum check
    if (rules.enum && !rules.enum.includes(String(value))) {
      return {
        valid: false,
        error: `${field} must be one of: ${rules.enum.join(", ")}.`,
      };
    }
  }

  return { valid: true, error: null };
}

// ============================================
// QUICK RESPONSE HELPER
// ============================================

export function validationError(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}