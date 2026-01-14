import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Parse coordinates dari string ke array [lat, lng]
export function parseCoordinates(coordString: string): [number, number] {
  const [lat, lng] = coordString.split(",").map(Number);
  return [lat, lng];
}

// Format coordinates dari array ke string
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat},${lng}`;
}
