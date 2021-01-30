import { Fraction } from "./fraction";

export const commonRatios = [
  { fraction: new Fraction(1, 1) },
  { fraction: new Fraction(2, 3) },
  { fraction: new Fraction(3, 2) },
  { fraction: new Fraction(3, 4) },
  { fraction: new Fraction(4, 3) },
  { fraction: new Fraction(16, 9) },
  { fraction: new Fraction(9, 16) },
  { fraction: new Fraction(5, 4) },
  { fraction: new Fraction(4, 5) },
  { fraction: new Fraction(3, 5) },
  { fraction: new Fraction(5, 3) },
  { fraction: new Fraction(3, 1) },
];

export const findClosestCommonAspectRatio = (ratio: Fraction) => {
  let closest: Fraction | undefined = undefined;
  let error = Number.MAX_VALUE;
  for (const r of commonRatios) {
    const rError = r.fraction.subtract(ratio).abs().toNumber();
    if (rError < error) {
      closest = r.fraction;
      error = rError;
    }
  }
  return { fraction: closest!, error: error / ratio.toNumber() };
};
