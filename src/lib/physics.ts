// Pure physics helpers. SI units unless stated.
export const E = 1.602176634e-19; // elementary charge, C
export const KB = 1.380649e-23; // Boltzmann, J/K
export const DA = 1.66053906660e-27; // atomic mass unit, kg
export const N0 = 2.686780111e25; // Loschmidt number, m^-3 (273.15 K, 101325 Pa)
export const R_GAS = 8.314462618; // J/(mol K)

/** Quadrupole: RF amplitude V (0-peak) and DC U for a given Mathieu a, q. */
export function qmfVoltages(mz: number, r0_m: number, f_Hz: number, q: number, a: number) {
  const m = mz * DA;
  const w = 2 * Math.PI * f_Hz;
  const V = (q * m * w * w * r0_m * r0_m) / (4 * E);
  const U = (a * m * w * w * r0_m * r0_m) / (8 * E);
  return { V, U };
}

export function lcResonance(L_H: number, C_F: number) {
  return 1 / (2 * Math.PI * Math.sqrt(L_H * C_F));
}

export function inductanceFor(f_Hz: number, C_F: number) {
  const w = 2 * Math.PI * f_Hz;
  return 1 / (w * w * C_F);
}

export function ionVelocity(mass_Da: number, z: number, V: number) {
  return Math.sqrt((2 * z * E * V) / (mass_Da * DA));
}

export const PRESSURE_UNITS = {
  Pa: 1,
  mbar: 100,
  bar: 1e5,
  Torr: 101325 / 760,
  atm: 101325,
  psi: 6894.757293168,
} as const;
export type PressureUnit = keyof typeof PRESSURE_UNITS;

export function convertPressure(value: number, from: PressureUnit, to: PressureUnit) {
  return (value * PRESSURE_UNITS[from]) / PRESSURE_UNITS[to];
}

export function meanFreePath(T_K: number, p_Pa: number, d_m: number) {
  return (KB * T_K) / (Math.SQRT2 * Math.PI * d_m * d_m * p_Pa);
}

export function meanSpeed(T_K: number, mass_Da: number) {
  return Math.sqrt((8 * KB * T_K) / (Math.PI * mass_Da * DA));
}

/** Choked (sonic) mass flow through a thin orifice, kg/s. */
export function chokedMassFlow(area_m2: number, p0_Pa: number, T_K: number, M_kgmol: number, gamma: number, Cd = 1) {
  const Rs = R_GAS / M_kgmol;
  return (
    Cd * area_m2 * p0_Pa * Math.sqrt(gamma / (Rs * T_K)) *
    Math.pow(2 / (gamma + 1), (gamma + 1) / (2 * (gamma - 1)))
  );
}

/** Molecular-flow conductance of a thin orifice, m^3/s. */
export function molecularConductance(area_m2: number, T_K: number, mass_Da: number) {
  return (area_m2 * meanSpeed(T_K, mass_Da)) / 4;
}

export function resolvingPower(m: number, dm: number) {
  return m / dm;
}

/** Mason–Schamp: CCS (m^2) from reduced mobility K0 (m^2/V/s). */
export function ccsFromK0(K0: number, ionMass_Da: number, gasMass_Da: number, z: number, T_K: number) {
  const mu = ((ionMass_Da * gasMass_Da) / (ionMass_Da + gasMass_Da)) * DA;
  return ((3 * z * E) / (16 * N0)) * Math.sqrt((2 * Math.PI) / (mu * KB * T_K)) / K0;
}

export function k0FromCcs(ccs_m2: number, ionMass_Da: number, gasMass_Da: number, z: number, T_K: number) {
  return ccsFromK0(1, ionMass_Da, gasMass_Da, z, T_K) / ccs_m2;
}

export function fmt(x: number, digits = 4) {
  if (!isFinite(x)) return "—";
  const a = Math.abs(x);
  if (a !== 0 && (a < 1e-3 || a >= 1e6)) return x.toExponential(digits - 1);
  return Number(x.toPrecision(digits)).toString();
}
