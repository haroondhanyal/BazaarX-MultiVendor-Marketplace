export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): boolean {
  return emailPattern.test(value.trim());
}

export function validatePassword(value: string): boolean {
  return value.length >= 8;
}
