import { describe, expect, it } from "vitest";
import * as P from "./physics";

describe("physics", () => {
  it("LC resonance: 1 µH and 1 nF give ~5.033 MHz", () => {
    expect(P.lcResonance(1e-6, 1e-9)).toBeCloseTo(5.0329e6, -2);
  });
  it("760 Torr equals 1 atm", () => {
    expect(P.convertPressure(760, "Torr", "atm")).toBeCloseTo(1, 9);
  });
  it("N2 mean free path at 1 Pa, 300 K is ~6.8 mm", () => {
    expect(P.meanFreePath(300, 1, 3.7e-10)).toBeCloseTo(6.81e-3, 4);
  });
  it("Knudsen number is λ / L", () => {
    expect(P.knudsenNumber(5e-3, 0.1)).toBeCloseTo(0.05, 12);
  });
  it("Flow regime boundaries: 0.001, 0.1 and 10", () => {
    expect(P.flowRegime(0.0005)).toBe("Continuum");
    expect(P.flowRegime(0.01)).toBe("Slip");
    expect(P.flowRegime(1)).toBe("Transition");
    expect(P.flowRegime(50)).toBe("Free molecular");
  });
  it("CCS ↔ K0 round-trips", () => {
    const ccs = P.ccsFromK0(1e-4, 500, 28, 1, 300);
    expect(P.k0FromCcs(ccs, 500, 28, 1, 300)).toBeCloseTo(1e-4, 12);
  });
  it("QMF U/V ratio at apex is a/(2q)", () => {
    const { U, V } = P.qmfVoltages(500, 4e-3, 1e6, 0.706, 0.237);
    expect(U / V).toBeCloseTo(0.237 / (2 * 0.706), 9);
  });
  it("10% valley separation is ~2.08 FWHM for Gaussian peaks", () => {
    expect(P.VALLEY10_FWHM_RATIO).toBeCloseTo(2.0789, 4);
    // so the 10% valley resolving power is about half the FWHM value
    expect(P.resolvingPowerValley10(500, 0.01)).toBeCloseTo(24050.9, 0);
    expect(P.resolvingPower(500, 0.01) / P.resolvingPowerValley10(500, 0.01))
      .toBeCloseTo(2.0789, 4);
  });
  it("axial velocity of m/z 500 at 10 eV is ~1964 m/s", () => {
    expect(P.axialVelocity(500, 10)).toBeCloseTo(1964.5, 0);
  });
  it("1 MHz over 200 mm at 1964.5 m/s is ~102 RF cycles", () => {
    expect(P.rfCycleCount(1e6, 0.2, 1964.5)).toBeCloseTo(101.8, 0);
  });
  it("ideal zone-1 ceiling is N²/10.9", () => {
    expect(P.dawsonResolutionLimit(100)).toBeCloseTo(917.43, 2);
  });
});
