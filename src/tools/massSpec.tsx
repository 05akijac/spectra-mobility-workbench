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
      <Section title="Example">
        <p>Mathieu stability presents an ideal mass pass band. This example initially does not include quadrupole length, ion kinetic energy or fringing fields. We need the field radius r₀ = 4 mm, a drive frequency of around 1 MHz, the target m/z (180) and the target resolution.</p>
        <TeX block>{String.raw`\Omega = 2\pi f = 2 \times 3.141 \times 1\times10^{6} = 6.28\times10^{6}\ \text{rad/s}`}</TeX>
        <p>The mass window follows from the resolution R = m/z ÷ Δm/z:</p>
        <TeX block>{String.raw`\Delta(m/z) = \frac{180}{180} = 1\ \text{Th} \;\Rightarrow\; \text{stable window} = 179.5\text{–}180.5\ \text{Th}`}</TeX>
        <p>Now we work out the RF amplitude and DC voltage, then the peak-to-peak voltage needed for a stable ion trajectory. The apex of the first stability region is a = 0.237, q = 0.706 — the point where the upper and lower stability boundaries of the first zone intersect, giving maximum resolving power when operated as a mass filter. The ratio a/q gives the scan-line slope of ~0.33.</p>
        <p>Using an ion mass of 180 amu = 2.989 × 10⁻²⁵ kg, rearrange the q parameter for voltage:</p>
        <TeX block>{String.raw`q = \frac{4eV}{m r_0^2 \Omega^2} \;\Rightarrow\; V = \frac{q\, m r_0^2 \Omega^2}{4e} = \frac{0.704698 \times 2.989\times10^{-25} \times (4\times10^{-3})^2 \times (6.28\times10^{6})^2}{4 \times 1.6\times10^{-19}} = 207.9\ \text{V}`}</TeX>
        <p>Then for the DC voltage, using a = 0.235570:</p>
        <TeX block>{String.raw`U = \frac{a\, m r_0^2 \Omega^2}{8e} = 34.70\ \text{V}`}</TeX>
        <p>The peak-to-peak voltage for each rod pair relative to the centre potential is V<sub>RF,pp</sub> = 2V = 415.21 V, and between opposing rod pairs the differential RF peak-to-peak voltage is 830.42 V. The rod potentials are therefore:</p>
        <TeX block>{String.raw`\Phi = \pm U + V\cos(\Omega t) = \pm 34.70 + 207.60\cos(\Omega t)`}</TeX>
        <p>We now have the voltages needed to produce a stable electric field for ions at m/z 180. Next we need the ion's trajectory through the quadrupole: does it remain stable, or does the amplitude grow until it hits a rod or the analyser wall?</p>
        <p>You could use an Euler integrator, but the implicit Euler method does not conserve energy and the amplitude grows over time — imagine a spring whose oscillations get larger after you let go, with no external energy added. We need a method that is numerically stable and does not magnify small errors into massive ones. Two helpful YouTube videos by Phanimations and Steve Brunton are linked below.</p>
        <p>We use the 4th-order Runge–Kutta (RK4) method to solve the ordinary differential equation. It takes four derivative estimates per step and averages them with different weights:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>acceleration at the beginning of the interval (k₁)</li>
          <li>acceleration halfway through, using a first prediction (k₂)</li>
          <li>an improved halfway prediction (k₃)</li>
          <li>acceleration at the end of the interval (k₄)</li>
        </ol>
        <p>RK4 needs first-order equations, so the Mathieu equation is split using v = dx/dt:</p>
        <TeX block>{String.raw`\frac{dv}{dt} = -\frac{\Omega^2}{4}\,(a - 2q\cos\Omega t)\,x`}</TeX>
        <p>Applying this to our example: at 1 MHz the RF period is 1 µs, and dividing it into 100 steps gives h = 10 ns. Start at t = 0, x = 0.0001 m, v = 0, with a = 0.235570, q = 0.704698, ion mass 180 Da, axial kinetic energy 10 eV and Ω = 6.2832 × 10⁶ rad/s. The four estimates are:</p>
        <TeX block>{String.raw`k_1 = hF(t, s), \quad k_2 = hF\!\left(t+\tfrac{h}{2}, s+\tfrac{k_1}{2}\right), \quad k_3 = hF\!\left(t+\tfrac{h}{2}, s+\tfrac{k_2}{2}\right), \quad k_4 = hF(t+h, s+k_3)`}</TeX>
        <div className="overflow-x-auto">
          <table className="text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left pr-6 py-1">Estimate</th>
                <th className="text-left pr-6 py-1">Change in x (m)</th>
                <th className="text-left py-1">Change in velocity (m/s)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="pr-6 py-1">k₁</td><td className="pr-6 py-1">0</td><td className="py-1">11.5852</td></tr>
              <tr className="border-b"><td className="pr-6 py-1">k₂</td><td className="pr-6 py-1">5.7926 × 10⁻⁸</td><td className="py-1">11.5783</td></tr>
              <tr className="border-b"><td className="pr-6 py-1">k₃</td><td className="pr-6 py-1">5.7926 × 10⁻⁸</td><td className="py-1">11.5817</td></tr>
              <tr><td className="pr-6 py-1">k₄</td><td className="pr-6 py-1">1.1582 × 10⁻⁷</td><td className="py-1">11.5644</td></tr>
            </tbody>
          </table>
        </div>
        <p>For k₁, the change in x is zero because vₓ = 0 at the start. The change in velocity is:</p>
        <TeX block>{String.raw`k_{1,v} = -h\,\frac{\Omega^2}{4}(a - 2q\cos\Omega t)\,x = -10^{-8} \times \frac{(6.2823\times10^{6})^2}{4} \times (0.235570 - 2(0.704698)\cos 0) \times 0.0001 = 11.5852\ \text{m/s}`}</TeX>
        <p>The later estimates each use the previous ones. They are then combined with their weights:</p>
        <TeX block>{String.raw`s_{n+1} = s_n + \frac{k_1 + 2k_2 + 2k_3 + k_4}{6}`}</TeX>
        <p>giving the new position and velocity after 10 ns: x = 0.1000579 mm and vₓ = 11.5783 m/s — the ion has moved about 0.058 µm in the x direction.</p>
        <p>For our 180 Da ion with 10 eV axial kinetic energy, the ion takes 30.54 µs to traverse the 100 mm quadrupole. At 10 ns per step, that is 30,540 ns ÷ 10 ns ≈ 3,054 RK4 steps. Working this out really makes you appreciate the intricacies of quadrupole mass spectrometers — and the computers that do this in incredibly short periods of time.</p>
        <p>To add more detail: what happens if ions have larger energies than 10 eV, or enter at an angle? An ion at 181 or 182 Th with a larger axial kinetic energy undergoes fewer oscillations because it spends less time in the quadrupole. Even if it is mathematically unstable in the infinite-duration analysis, it can escape before its amplitude grows enough to hit a rod, and still reach the detector. If an ion enters at 2° to the axis, v<sub>z</sub> = v cos(2°), so at 10 eV it would have a transverse velocity of about 114 m/s. RK4 must then include this initial transverse velocity, which changes the trajectory and may cause an otherwise stable ion to strike an electrode.</p>
        <p>The mass-transmission curve is then:</p>
        <TeX block>{String.raw`T(m/z) = \frac{\text{ions exiting the 100 mm quadrupole}}{\text{ions injected}} \times 100\%`}</TeX>
        <p className="text-sm text-muted-foreground">Further reading: R. L. Schrader, <em>J. Am. Soc. Mass Spectrom.</em> (2024), <a href="https://doi.org/10.1021/jasms.4c00051" target="_blank" rel="noreferrer" className="underline">doi.org/10.1021/jasms.4c00051</a>; videos by Phanimations and Steve Brunton on numerical integration.</p>
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
