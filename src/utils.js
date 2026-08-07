import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getPurchasePriceCode(price, mapStr = "OABCDEFGHI", markupPercent = 0) {
  if (!price || isNaN(price)) return "";
  const numPrice = parseFloat(price);
  const markedUpPrice = numPrice * (1 + (parseFloat(markupPercent) || 0) / 100);
  const roundedPrice = Math.round(markedUpPrice).toString();
  
  let secretCode = "";
  for (let digit of roundedPrice) {
    const digitIdx = parseInt(digit, 10);
    if (!isNaN(digitIdx) && mapStr[digitIdx]) {
      secretCode += mapStr[digitIdx];
    } else {
      secretCode += digit;
    }
  }
  return secretCode;
}
