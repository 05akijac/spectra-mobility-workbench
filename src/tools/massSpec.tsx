import { useState } from "react";
import { Calculator, Field, Section, TeX } from "@/components/ToolKit";
import * as P from "@/lib/physics";

export function QmfTool() {
  const [mz, setMz] = useState(500);
  const [r0, setR0] = useState(4);
  const [f, setF] = useState(1);
  const { V, U } = P.qmfVoltages(mz, r0 * 1e-3, f * 1e6, 0.706, 0.237);
  return (
    <>
      <Calculator
        inputs={<>
          <Field label="m/z" unit="Th" value={mz} onChange={setMz} />
          <Field label="Field radius r₀" unit="mm" value={r0} onChange={setR0} />
          <Field label="RF frequency" unit="MHz" value={f} onChange={setF} />
        </>}
        results={[
          ["RF amplitude V (0-peak)", `${P.fmt(V)} V`],
          ["RF amplitude (peak-peak)", `${P.fmt(2 * V)} V`],
          ["DC voltage U", `${P.fmt(U)} V`],
          ["U / V", P.fmt(U / V)],
        ]}
      />
      <Section title="How it works">
        <p>The calculator returns the voltages that place your ion at the apex of the first stability region (q = 0.706, a = 0.237). At the apex, the filter transmits only a narrow band of m/z around that value.</p>
      </Section>
      <Section title="Theory">
        <p>Ion motion in an ideal quadrupole follows the Mathieu equation with dimensionless parameters</p>
        <TeX block>{String.raw`a_u = \frac{8 z e U}{m \omega^2 r_0^2}, \qquad q_u = \frac{4 z e V}{m \omega^2 r_0^2}, \qquad \omega = 2\pi f`}</TeX>
        <p>where V is the zero-to-peak RF amplitude between a rod and the axis, and U is the DC voltage. Scanning U and V together at a fixed ratio <TeX>{String.raw`U/V = a/2q \approx 0.168`}</TeX> sweeps successive m/z values through the stability apex.</p>
        <p className="text-sm text-muted-foreground">Ref: P. H. Dawson, <em>Quadrupole Mass Spectrometry and its Applications</em>, Elsevier (1976).</p>
      </Section>
    </>
  );
}

export function LcTool() {
  const [L, setL] = useState(10);
  const [C, setC] = useState(100);
  const [ft, setFt] = useState(1);
  const f = P.lcResonance(L * 1e-6, C * 1e-12);
  const Lreq = P.inductanceFor(ft * 1e6, C * 1e-12);
  return (
    <>
      <Calculator
        inputs={<>
          <Field label="Inductance L" unit="µH" value={L} onChange={setL} />
          <Field label="Total capacitance C" unit="pF" value={C} onChange={setC} />
          <Field label="Target frequency" unit="MHz" value={ft} onChange={setFt} />
        </>}
        results={[
          ["Resonant frequency", `${P.fmt(f / 1e6)} MHz`],
          ["L required for target frequency", `${P.fmt(Lreq * 1e6)} µH`],
        ]}
      />
      <Section title="How it works">
        <p>Enter the coil inductance and the total capacitance. The total includes the rod assembly, cables and stray capacitance. The tool returns the resonant frequency of the tank, and the inductance you would need to reach a target frequency.</p>
      </Section>
      <Section title="Theory">
        <p>An ideal LC circuit resonates where the inductive and capacitive reactances are equal, <TeX>{String.raw`\omega L = 1/\omega C`}</TeX>, giving</p>
        <TeX block>{String.raw`f_0 = \frac{1}{2\pi\sqrt{LC}}, \qquad L = \frac{1}{(2\pi f_0)^2 C}`}</TeX>
        <p>In a real RF supply, losses set the quality factor Q. The voltage step-up at resonance is roughly Q times the drive voltage.</p>
      </Section>
    </>
  );
}

export function KeTool() {
  const [m, setM] = useState(500);
  const [z, setZ] = useState(1);
  const [V, setV] = useState(1000);
  const [Lf, setLf] = useState(1);
  const v = P.ionVelocity(m, z, V);
  return (
    <>
      <Calculator
        inputs={<>
          <Field label="Ion mass" unit="Da" value={m} onChange={setM} />
          <Field label="Charge z" value={z} onChange={setZ} step="1" />
          <Field label="Accelerating potential" unit="V" value={V} onChange={setV} />
          <Field label="Flight distance" unit="m" value={Lf} onChange={setLf} />
        </>}
        results={[
          ["Kinetic energy", `${P.fmt(z * V)} eV`],
          ["Kinetic energy", `${P.fmt(z * V * P.E)} J`],
          ["Velocity", `${P.fmt(v)} m/s`],
          ["Flight time", `${P.fmt((Lf / v) * 1e6)} µs`],
        ]}
      />
      <Section title="How it works">
        <p>An ion accelerated through a potential difference gains energy equal to its charge times the voltage. The tool converts that energy into a velocity and a field-free flight time, as in a time-of-flight analyser.</p>
      </Section>
      <Section title="Theory">
        <TeX block>{String.raw`E_k = zeV = \tfrac{1}{2} m v^2 \;\Rightarrow\; v = \sqrt{\frac{2zeV}{m}}, \qquad t = \frac{L}{v} = L\sqrt{\frac{m}{2zeV}}`}</TeX>
        <p>Flight time scales with <TeX>{String.raw`\sqrt{m/z}`}</TeX>, which is the basis of TOF mass analysis. This is a non-relativistic treatment, which is accurate for typical MS energies.</p>
      </Section>
    </>
  );
}

export function PressureTool() {
  const [val, setVal] = useState(1);
  const [unit, setUnit] = useState<P.PressureUnit>("mbar");
  const units = Object.keys(P.PRESSURE_UNITS) as P.PressureUnit[];
  return (
    <>
      <Calculator
        inputs={<>
          <Field label="Pressure" value={val} onChange={setVal} />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Unit</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value as P.PressureUnit)} className="rounded-md border border-input bg-background px-3 py-2">
              {units.map((u) => <option key={u}>{u}</option>)}
            </select>
          </label>
        </>}
        results={units.map((u) => [u, P.fmt(P.convertPressure(val, unit, u), 5)])}
      />
      <Section title="How it works">
        <p>The value is converted to pascals and then into each of the other units.</p>
      </Section>
      <Section title="Theory">
        <TeX block>{String.raw`1\ \text{atm} = 101325\ \text{Pa} = 760\ \text{Torr} = 1.01325\ \text{bar}, \quad 1\ \text{mbar} = 100\ \text{Pa}`}</TeX>
        <p>Typical regimes: rough vacuum (above 1 mbar), high vacuum (10⁻³ to 10⁻⁷ mbar), and ultra-high vacuum (below 10⁻⁷ mbar). Mass analysers usually run below 10⁻⁵ mbar.</p>
      </Section>
    </>
  );
}

export function OrificeTool() {
  const [d, setD] = useState(0.5);
  const [p0, setP0] = useState(1013.25);
  const [T, setT] = useState(293);
  const [M, setM] = useState(28.0);
  const [g, setG] = useState(1.4);
  const A = Math.PI * (d * 1e-3) ** 2 / 4;
  const mdot = P.chokedMassFlow(A, p0 * 100, T, M / 1000, g);
  const Qv = (mdot * P.R_GAS * T) / (M / 1000);
  const C = P.molecularConductance(A, T, M);
  const lam = P.meanFreePath(T, p0 * 100, 3.7e-10);
  const Kn = lam / (d * 1e-3);
  return (
    <>
      <Calculator
        inputs={<>
          <Field label="Orifice diameter" unit="mm" value={d} onChange={setD} />
          <Field label="Upstream pressure" unit="mbar" value={p0} onChange={setP0} />
          <Field label="Temperature" unit="K" value={T} onChange={setT} />
          <Field label="Gas molar mass" unit="g/mol" value={M} onChange={setM} />
          <Field label="Heat capacity ratio γ" value={g} onChange={setG} />
        </>}
        results={[
          ["Knudsen number (N₂ diameter)", P.fmt(Kn)],
          ["Regime", Kn < 0.01 ? "Viscous (choked)" : Kn > 0.5 ? "Molecular" : "Transitional"],
          ["Choked mass flow", `${P.fmt(mdot)} kg/s`],
          ["Choked throughput", `${P.fmt(Qv * 10)} mbar·L/s`],
          ["Molecular conductance", `${P.fmt(C * 1000)} L/s`],
          ["Molecular throughput (to vacuum)", `${P.fmt(C * 1000 * p0)} mbar·L/s`],
        ]}
      />
      <Section title="How it works">
        <p>The Knudsen number (mean free path ÷ orifice diameter) shows which flow regime applies. At atmospheric inlets, flow is viscous and choked. Between low-pressure stages, the molecular formula applies. The tool assumes an ideal thin orifice with a discharge coefficient of 1.</p>
      </Section>
      <Section title="Theory">
        <p>Choked (sonic) flow, valid when the downstream pressure is below about 0.53 p₀ for air:</p>
        <TeX block>{String.raw`\dot m = A\,p_0\sqrt{\frac{\gamma}{R_s T}}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}, \qquad Q = \dot m R_s T`}</TeX>
        <p>Molecular flow through a thin aperture:</p>
        <TeX block>{String.raw`C = \frac{A\bar v}{4}, \qquad \bar v = \sqrt{\frac{8k_BT}{\pi m}}, \qquad Q = C\,(p_1 - p_2)`}</TeX>
      </Section>
    </>
  );
}

export function MfpTool() {
  const [p, setP] = useState(1e-3);
  const [T, setT] = useState(300);
  const [d, setD] = useState(0.37);
  const [m, setM] = useState(28);
  const lam = P.meanFreePath(T, p * 100, d * 1e-9);
  const v = P.meanSpeed(T, m);
  return (
    <>
      <Calculator
        inputs={<>
          <Field label="Pressure" unit="mbar" value={p} onChange={setP} />
          <Field label="Temperature" unit="K" value={T} onChange={setT} />
          <Field label="Molecular diameter (N₂ ≈ 0.37)" unit="nm" value={d} onChange={setD} />
          <Field label="Particle mass" unit="Da" value={m} onChange={setM} />
        </>}
        results={[
          ["Mean free path λ", `${P.fmt(lam * 1000)} mm`],
          ["Number density n", `${P.fmt((p * 100) / (P.KB * T))} m⁻³`],
          ["Mean speed v̄", `${P.fmt(v)} m/s`],
          ["Collision frequency ν", `${P.fmt(v / lam)} s⁻¹`],
        ]}
      />
      <Section title="How it works">
        <p>The tool uses kinetic gas theory for a single gas of hard spheres. The collision frequency is the mean speed divided by the mean free path.</p>
      </Section>
      <Section title="Theory">
        <TeX block>{String.raw`\lambda = \frac{k_B T}{\sqrt{2}\,\pi d^2 p}, \qquad \bar v = \sqrt{\frac{8k_BT}{\pi m}}, \qquad \nu = \frac{\bar v}{\lambda} = \sqrt{2}\,n\,\pi d^2\,\bar v`}</TeX>
        <p>The <TeX>{String.raw`\sqrt 2`}</TeX> factor accounts for the relative motion of the colliding molecules. For an ion in a different buffer gas, use the reduced mass and the collision cross section instead.</p>
      </Section>
    </>
  );
}

export function ResolvingTool() {
  const [m, setM] = useState(500);
  const [fwhm, setFwhm] = useState(0.01);
  const [m2, setM2] = useState(500.01);
  const R = P.resolvingPower(m, fwhm);
  return (
    <>
      <Calculator
        inputs={<>
          <Field label="Peak m/z" value={m} onChange={setM} />
          <Field label="Peak width (FWHM)" unit="Th" value={fwhm} onChange={setFwhm} />
          <Field label="Neighbouring peak m/z" value={m2} onChange={setM2} />
        </>}
        results={[
          ["Resolving power m/Δm", P.fmt(R, 5)],
          ["Peak width", `${P.fmt((fwhm / m) * 1e6)} ppm`],
          ["R needed to separate the two peaks", P.fmt(m / Math.abs(m2 - m), 5)],
        ]}
      />
      <Section title="How it works">
        <p>Resolving power uses the FWHM definition. The second result is the minimum resolving power needed for two peaks to be separated by one FWHM.</p>
      </Section>
      <Section title="Theory">
        <TeX block>{String.raw`R = \frac{m}{\Delta m_{\text{FWHM}}}, \qquad \text{width (ppm)} = \frac{\Delta m}{m}\times 10^6`}</TeX>
        <p>Resolving power varies with m/z depending on the analyser: roughly constant for TOF, proportional to <TeX>{String.raw`1/\sqrt{m/z}`}</TeX> for Orbitrap, and proportional to <TeX>{String.raw`1/(m/z)`}</TeX> for FT-ICR.</p>
      </Section>
    </>
  );
}
