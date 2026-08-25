import { SquareClient, SquareEnvironment } from "square";

let squareClient: SquareClient | null = null;

export function isSquareConfigured(): boolean {
  return !!(
    (process.env.SQUARE_ACCESS_TOKEN || process.env.SQUARE_TOKEN) &&
    process.env.SQUARE_LOCATION_ID
  );
}

export function getSquareClient(): SquareClient | null {
  if (!isSquareConfigured()) {
    return null;
  }

  if (!squareClient) {
    const accessToken =
      process.env.SQUARE_ACCESS_TOKEN || process.env.SQUARE_TOKEN;

    if (!accessToken) {
      console.error("Square access token not found in environment variables");
      return null;
    }

    const useSandbox =
      process.env.SQUARE_ENVIRONMENT?.toLowerCase() === "sandbox";
    squareClient = new SquareClient({
      bearerAuthCredentials: {
        accessToken,
      },
      environment: useSandbox
        ? SquareEnvironment.Sandbox
        : SquareEnvironment.Production,
    });
  }

  return squareClient;
}

export function getSquareLocationId(): string | null {
  return process.env.SQUARE_LOCATION_ID || null;
}

export function getSquareApplicationId(): string | null {
  return process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || null;
}

export type SquareCheckoutCurrency = "CAD" | "USD";

export function toSquareCurrency(code?: string | null): SquareCheckoutCurrency {
  return code === "USD" ? "USD" : "CAD";
}
