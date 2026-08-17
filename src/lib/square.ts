// @ts-ignore - Square SDK has issues with Next.js types
const square = require("square");
const { SquareClient, SquareEnvironment } = square;

let squareClient: any | null = null;

export function isSquareConfigured(): boolean {
  return !!(
    process.env.SQUARE_ACCESS_TOKEN &&
    process.env.SQUARE_LOCATION_ID &&
    process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID
  );
}

export function getSquareClient(): any | null {
  if (!isSquareConfigured()) {
    return null;
  }

  if (!squareClient) {
    const accessToken = process.env.SQUARE_ACCESS_TOKEN || process.env.SQUARE_TOKEN;
    
    if (!accessToken) {
      console.error("Square access token not found in environment variables");
      return null;
    }
    
    // Production credentials are being used, so always use Production environment
    squareClient = new SquareClient({
      bearerAuthCredentials: {
        accessToken: accessToken,
      },
      environment: SquareEnvironment.Production,
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
