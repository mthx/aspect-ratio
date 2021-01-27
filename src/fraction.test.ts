import { findApproximateAspectRatio, Fraction, humanizeToString } from "./fraction";

describe("Fraction", () => {
  describe("toString", () => {
    it("shows a string representation", ()=> {
      expect(new Fraction(1, 10).toString()).toEqual("1/10");
    })
  })
  describe("limitDenominator", () => {
    it("matches doctest examples", () => {
      const numerator = 3141592653589793;
      const denominator = 1000000000000000;
      const pi = new Fraction(numerator, denominator);
      expect(pi.limitDenominator(10)).toEqual(new Fraction(22, 7));
      expect(pi.limitDenominator(100)).toEqual(new Fraction(311, 99));
      expect(new Fraction(4321, 8765).limitDenominator(10000)).toEqual(new Fraction(4321, 8765));
    })
  })
})

describe("findApproximateAspectRatio", () => {
  it("works for exact", () => {
    expect(findApproximateAspectRatio(200, 100)).toEqual({
      error: 0,
      ratio: new Fraction(2, 1)
    })
    expect(findApproximateAspectRatio(16 * 420, 9 * 420)).toEqual({
      error: 0,
      ratio: new Fraction(16, 9)
    })
  });
  it("returns error for approx", () => {
    expect(findApproximateAspectRatio(200, 101)).toEqual({
      error: 0.01,
      ratio: new Fraction(2, 1)
    })
    expect(findApproximateAspectRatio(200, 102)).toEqual({
      error: 0.02,
      ratio: new Fraction(2, 1)
    })
    expect(findApproximateAspectRatio(16 * 420 + 5, 9 * 420 - 5)).toEqual({
      error: 0.0020652622883106154,
      ratio: new Fraction(16, 9)
    })
  })
});

describe("humanizeToString", () => {
  it("lala", () => {
    new Fraction()
  });
  it("changes powers of 10", () => {
    // Hmm, this is actually 37/20.
    expect(humanizeToString(new Fraction(185, 100))).toEqual("1.85:1");
  })
})