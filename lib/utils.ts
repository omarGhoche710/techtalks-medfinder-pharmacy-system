// ============================================
// ERROR HANDLING
// ============================================

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof AppError) {
    throw error;
  } else if (error instanceof Error) {
    throw new AppError(error.message, 500);
  } else if (typeof error === "string") {
    throw new AppError(error, 500);
  } else {
    throw new AppError("An unknown error occurred.", 500);
  }
};

export function formatErrorResponse(error: unknown): {
  message: string;
  statusCode: number;
} {
  if (error instanceof AppError) {
    return { message: error.message, statusCode: error.statusCode };
  }
  return {
    message: "Internal server error.",
    statusCode: 500,
  };
}

// ============================================
// DISTANCE CALCULATION
// ============================================

export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}