/**
 * Minimal fraction implementation as required by this project.
 * Some code derived from cpython's fractions.py.
 *
 * https://github.com/python/cpython/blob/master/Lib/fractions.py
 * https://github.com/python/cpython/blob/master/LICENSE
 *
 * Credits from that file:
 * - Originally contributed by Sjoerd Mullender.
 * - Significantly modified by Jeffrey Yasskin <jyasskin at gmail.com>.
 */
export class Fraction {
  public numerator: number;
  public denominator: number;

  constructor(numerator: number, denominator: number, normalize = true) {
    if (!Number.isInteger(numerator)) {
      throw new Error(`Fraction only supports integer numerators`);
    }
    if (!Number.isInteger(denominator)) {
      throw new Error(`Fraction only supports integer denominators`);
    }
    if (denominator === 0) {
      throw new Error("Zero denominator");
    }
    if (normalize) {
      if (denominator < 0) {
        denominator = -denominator;
        numerator = -numerator;
      }
      let g = gcd(numerator, denominator);
      numerator /= g;
      denominator /= g;
    }
    this.numerator = numerator;
    this.denominator = denominator;
  }

  toString() {
    return `${this.numerator}/${this.denominator}`;
  }

  subtract(other: Fraction): Fraction {
    return new Fraction(
      this.numerator * other.denominator - other.numerator * this.denominator,
      this.denominator * other.denominator
    );
  }

  abs() {
    return new Fraction(Math.abs(this.numerator), this.denominator, false);
  }

  compareTo(other: Fraction) {
    const lhs = this.numerator * other.denominator;
    const rhs = this.denominator * other.numerator;
    if (lhs < rhs) return -1;
    if (lhs > rhs) return 1;
    return 0;
  }

  toNumber(): number {
    return this.numerator / this.denominator;
  }

  /**
   * @param maxDenominator The maximum acceptable denominator.
   */
  limitDenominator(maxDenominator = 1000000) {
    // Algorithm notes: For any real number x, define a *best upper
    // approximation* to x to be a rational number p/q such that:
    //
    //   (1) p/q >= x, and
    //   (2) if p/q > r/s >= x then s > q, for any rational r/s.
    //
    // Define *best lower approximation* similarly.  Then it can be
    // proved that a rational number is a best upper or lower
    // approximation to x if, and only if, it is a convergent or
    // semiconvergent of the (unique shortest) continued fraction
    // associated to x.
    //
    // To find a best rational approximation with denominator <= M,
    // we find the best upper and lower approximations with
    // denominator <= M and take whichever of these is closer to x.
    // In the event of a tie, the bound with smaller denominator is
    // chosen.  If both denominators are equal (which can happen
    // only when maxDenominator == 1 and self is midway between
    // two integers) the lower bound---i.e., the floor of this, is
    // taken.

    if (maxDenominator < 1) {
      throw new Error("maxDenominator should be at least 1");
    }
    if (this.denominator <= maxDenominator) {
      return this;
    }

    let p0 = 0;
    let q0 = 1;
    let p1 = 1;
    let q1 = 0;

    let n = this.numerator;
    let d = this.denominator;
    while (true) {
      const a = Math.floor(n / d);
      const q2 = q0 + a * q1;
      if (q2 > maxDenominator) {
        break;
      }
  
      const p0Prime = p1;
      const q0Prime = q1;
      const p1Prime = p0 + a * p1;
      const q1Prime = q2;
      p0 = p0Prime;
      q0 = q0Prime;
      p1 = p1Prime;
      q1 = q1Prime;

      const nPrime = d;
      const dPrime = n - a * d;
      n = nPrime;
      d = dPrime;
    }

    const k = Math.floor((maxDenominator - q0) / q1);
    const bound1 = new Fraction(p0 + k * p1, q0 + k * q1);
    const bound2 = new Fraction(p1, q1);
    if (
      bound2.subtract(this).abs().compareTo(bound1.subtract(this).abs()) <= 0
    ) {
      return bound2;
    } else {
      return bound1;
    }
  }
}

export function findApproximateAspectRatio(ratio: Fraction)  {
  const limit10 = ratio.limitDenominator(10);
  const error = limit10.subtract(ratio).abs().toNumber() / ratio.toNumber();
  return { fraction: limit10, error };
}

function gcd(a: number, b: number) {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error("integers only");
  }
  a = Math.abs(a);
  b = Math.abs(b);
  if (b > a) {
    const temp = a;
    a = b;
    b = temp;
  }
  while (true) {
    if (b === 0) return a;
    a %= b;
    if (a === 0) return b;
    b %= a;
  }
}
