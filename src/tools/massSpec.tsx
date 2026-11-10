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
        <p>Mathieu stability presents an ideal mass pass band. This example initially does not include quadrupole length, ion kinetic energy or fringing fields (these will be included later on). We need the field radius r₀ = 4 mm, a drive frequency of around 1 MHz, the target m/z (180) and the target resolution.</p>
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
        <p>For our 180 Da ion with 10 eV axial kinetic energy, the ion takes 30.54 µs to traverse the 100 mm quadrupole. At 10 ns per step, that is 30,540 ns ÷ 10 ns ≈ 3,054 RK4 steps.<br /><br /><br />Working this out has really made me appreciate the intricacies of quadrupole mass spectrometers, and the computers that do this in incredibly short periods of time.</p>
        <p>To add more detail: what happens if ions have larger energies than 10 eV, or enter at an angle? <br /><br /><br />An ion at 181 or 182 Th with a larger axial kinetic energy undergoes fewer oscillations because it spends less time in the quadrupole. Even if it is mathematically unstable in the infinite-duration analysis, it can escape before its amplitude grows enough to hit a rod, and still reach the detector. If an ion enters at 2° to the axis, v<sub>z</sub> = v cos(2°), so at 10 eV it would have a transverse velocity of about 114 m/s. RK4 must then include this initial transverse velocity, which changes the trajectory and may cause an otherwise stable ion to strike an electrode.</p>
        <p>The mass-transmission curve is then:</p>
        <TeX block>{String.raw`T(m/z) = \frac{\text{ions exiting the 100 mm quadrupole}}{\text{ions injected}} \times 100\%`}</TeX>
        <p className="text-sm text-muted-foreground">This is a really good paper for further reading: R. L. Schrader, <em>J. Am. Soc. Mass Spectrom.</em> (2024), <a href="https://doi.org/10.1021/jasms.4c00051" target="_blank" rel="noreferrer" className="underline">doi.org/10.1021/jasms.4c00051</a><br /><br /><br />YouTube channels Phanimations and Steve Brunton on numerical integration helped massively with the understanding of Euler's method of integration as well as just visualising the different differential methods.<br /><br /></p>
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
        <p>Flight time scales with <TeX>{String.raw`\sqrt{m/z}`}</TeX>, which is the basis of TOF mass analysis. This is a non-relativistic treatment, which is accurate for typical MS energies.<br /><br /><br />I'm looking at including a tool that accounts for</p>
        <div>I'm looking at including a relativistic check soon..</div>
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
  const [L, setL] = useState(100);
  const lam = P.meanFreePath(T, p * 100, d * 1e-9);
  const v = P.meanSpeed(T, m);
  const Kn = P.knudsenNumber(lam, L * 1e-3);
  return (
    <>
      <Calculator
        inputs={<>
          <Field label="Pressure" unit="mbar" value={p} onChange={setP} />
          <Field label="Temperature" unit="K" value={T} onChange={setT} />
          <Field label="Molecular diameter (N₂ ≈ 0.37)" unit="nm" value={d} onChange={setD} />
          <Field label="Particle mass" unit="Da" value={m} onChange={setM} />
          <Field label="Characteristic length L (e.g. chamber size)" unit="mm" value={L} onChange={setL} />
        </>}
        results={[
          ["Mean free path λ", `${P.fmt(lam * 1000)} mm`],
          ["Number density n", `${P.fmt((p * 100) / (P.KB * T))} m⁻³`],
          ["Mean speed v̄", `${P.fmt(v)} m/s`],
          ["Collision frequency ν", `${P.fmt(v / lam)} s⁻¹`],
          ["Knudsen number Kn = λ/L", P.fmt(Kn)],
          ["Flow regime", P.flowRegime(Kn)],
        ]}
      />
      <Section title="How it works">
        <p>The tool uses kinetic gas theory for a single gas of hard spheres. The collision frequency is the mean speed divided by the mean free path. The Knudsen number compares the mean free path with the size of your system to show how the gas behaves.</p>
      </Section>
      <Section title="Theory">
        <p className="text-sm text-muted-foreground">The physics is taken from the University of Virginia physics classes.</p>
        <h3 className="font-serif text-xl text-foreground pt-2">Mean free path</h3>
        <p>The mean free path, the average distance a gas molecule travels between collisions, can be estimated from kinetic theory:</p>
        <TeX block>{String.raw`\lambda = \frac{\text{total distance travelled}}{\text{number of collisions}} = \frac{L}{\pi d^2 L\, n} = \frac{1}{\pi d^2 n}`}</TeX>
        <p>Here <TeX>{String.raw`\pi d^2`}</TeX> is the collision cross section. Two spheres of diameter d collide if their centres come within d of each other; adding their two radii gives the full molecular diameter. n is the number of molecules per unit volume.</p>
        <p>This first definition assumes the other molecules are at rest, but they are all moving. A molecule of O₂, for example, moves at around 460 m/s at room temperature and pressure. Because the directions are random, the velocities average to zero, so we use the root-mean-square velocity instead. The mean square of the relative velocity is twice the mean square velocity, so the rms relative velocity is larger by a factor of <TeX>{String.raw`\sqrt 2`}</TeX>. The collision rate goes up by this factor, and the mean free path goes down by it:</p>
        <TeX block>{String.raw`\lambda = \frac{1}{\sqrt{2}\,\pi d^2 n}`}</TeX>
        <p>From the ideal gas law, <TeX>{String.raw`n = p / k_B T`}</TeX>, so we can substitute in pressure, the Boltzmann constant and temperature. The Boltzmann constant relates the average kinetic energy of the particles in a gas to its thermodynamic temperature.</p>
        <TeX block>{String.raw`\lambda = \frac{k_B T}{\sqrt{2}\,\pi d^2 p}`}</TeX>

        <h3 className="font-serif text-xl text-foreground pt-2">Collision frequency</h3>
        <p>Collision frequency is the average number of collisions a particle makes per unit time (see Chemistry LibreTexts):</p>
        <TeX block>{String.raw`Z = \frac{\text{volume of collision cylinder} \times \text{number density}}{\text{time}}`}</TeX>
        <p>The volume of the collision cylinder is <TeX>{String.raw`\pi d^2 \times \text{length}`}</TeX>. The length is the distance swept out in time t at the mean relative speed, <TeX>{String.raw`\sqrt{2}\,\langle c\rangle\, t`}</TeX>, where the mean speed is</p>
        <TeX block>{String.raw`\langle c\rangle = \bar v = \sqrt{\frac{8 k_B T}{\pi m}}`}</TeX>
        <p>The number density comes from the pressure through the ideal gas law, <TeX>{String.raw`N/V = p / k_B T`}</TeX>. Substituting into the full equation:</p>
        <TeX block>{String.raw`Z = \sqrt{2}\,\pi d^2 \langle c\rangle \frac{N}{V} = \frac{\langle c\rangle}{\lambda}`}</TeX>

        <h3 className="font-serif text-xl text-foreground pt-2">Knudsen number</h3>
        <p>The Knudsen number is a dimensionless quantity from fluid mechanics. It is the ratio of the molecular mean free path λ to a characteristic length scale L of the system (for example a chamber, tube or orifice diameter):</p>
        <TeX block>{String.raw`Kn = \frac{\lambda}{L}`}</TeX>
        <p>The value of Kn tells you how the gas behaves in a given environment:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Continuum flow (Kn &lt; 0.001):</strong> the mean free path is tiny compared with the system, so the gas acts like a smooth, continuous substance.</li>
          <li><strong>Slip flow (0.001 &lt; Kn &lt; 0.1):</strong> gas molecules begin to slip slightly along solid surfaces rather than coming to a dead stop.</li>
          <li><strong>Transition flow (0.1 &lt; Kn &lt; 10):</strong> the continuum assumption breaks down significantly. Both molecular collisions and surface interactions matter.</li>
          <li><strong>Free molecular flow (Kn &gt; 10):</strong> the mean free path is much larger than the object or channel. Molecules hit the walls far more often than each other. This is typical of high-vacuum systems such as mass spectrometers.</li>
        </ul>
        <p>For an ion in a different buffer gas, use the reduced mass and the collision cross section instead.</p>
      </Section>
    </>
  );
}

function ModeTabs({
  value, options, onChange,
}: { value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={
            "rounded-md border px-4 py-2 text-sm transition-colors " +
            (value === id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-background text-muted-foreground hover:bg-secondary")
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function WidthMode() {
  const [m, setM] = useState(500);
  const [fwhm, setFwhm] = useState(0.01);
  const [m2, setM2] = useState(500.01);
  const R = P.resolvingPower(m, fwhm);
  const Rv = P.resolvingPowerValley10(m, fwhm);
  return (
    <Calculator
      inputs={<>
        <Field label="Peak m/z" value={m} onChange={setM} />
        <Field label="Peak width (FWHM)" unit="Th" value={fwhm} onChange={setFwhm} />
        <Field label="Neighbouring peak m/z" value={m2} onChange={setM2} />
      </>}
      results={[
        ["Resolving power, FWHM definition", P.fmt(R, 5)],
        ["Resolving power, 10% valley definition", P.fmt(Rv, 5)],
        ["10% valley separation ÷ FWHM", P.fmt(P.VALLEY10_FWHM_RATIO, 4)],
        ["Peak width", `${P.fmt((fwhm / m) * 1e6)} ppm`],
        ["R needed to separate the two peaks", P.fmt(m / Math.abs(m2 - m), 5)],
      ]}
    />
  );
}

function QuadMode() {
  const [mz, setMz] = useState(500);
  const [r0, setR0] = useState(4);
  const [f, setF] = useState(1);
  const [L, setL] = useState(200);
  const [ez, setEz] = useState(10);
  const [eta, setEta] = useState(0.5);
  const vz = P.axialVelocity(mz, ez);
  const t = (L * 1e-3) / vz;
  const N = P.rfCycleCount(f * 1e6, L * 1e-3, vz);
  const Rideal = P.dawsonResolutionLimit(N);
  const Rprac = eta * Rideal;
  const { V, U } = P.qmfVoltages(mz, r0 * 1e-3, f * 1e6, 0.706, 0.237);
  return (
    <Calculator
      inputs={<>
        <Field label="m/z" unit="Th" value={mz} onChange={setMz} />
        <Field label="Field radius r₀" unit="mm" value={r0} onChange={setR0} />
        <Field label="RF frequency" unit="MHz" value={f} onChange={setF} />
        <Field label="Filter length" unit="mm" value={L} onChange={setL} />
        <Field label="Axial kinetic energy" unit="eV" value={ez} onChange={setEz} />
        <Field label="Practical fraction of ideal, η" value={eta} onChange={setEta} />
      </>}
      results={[
        ["Axial velocity v_z", `${P.fmt(vz)} m/s`],
        ["Time in the filter", `${P.fmt(t * 1e6)} µs`],
        ["RF cycles N = f L / v_z", P.fmt(N)],
        ["RF amplitude V at the apex", `${P.fmt(V)} V`],
        ["DC voltage U at the apex", `${P.fmt(U)} V`],
        ["Ideal ceiling R = N² / 10.9", P.fmt(Rideal, 5)],
        ["Practical benchmark R = η N² / 10.9", P.fmt(Rprac, 5)],
        ["Peak width at the practical benchmark", `${P.fmt(mz / Rprac)} Th`],
        ["Unit-mass resolution possible?", Rprac >= mz ? "Yes" : "No"],
      ]}
    />
  );
}

export function ResolvingTool() {
  const [mode, setMode] = useState("width");
  return (
    <>
      <ModeTabs
        value={mode}
        onChange={setMode}
        options={[["width", "Peak width"], ["quad", "Quadrupole"]]}
      />
      <div className="mt-4">
        {mode === "quad" ? <QuadMode /> : <WidthMode />}
      </div>
      <Section title="How it works">
        <p><strong>Peak width mode</strong> turns a measured peak width into resolving power under both definitions, and reports the minimum resolving power needed to separate two peaks.</p>
        <p><strong>Quadrupole mode</strong> derives the RF cycle count from the rod geometry, the drive frequency and the ion kinetic energy, then compares R against both a practical empirical benchmark and the theoretical ceiling.</p>
        <p><strong>TOF mode</strong> builds a full time-domain noise budget — detector bandwidth, timing jitter, ion energy spread, extraction pulse width, and collision broadening from residual gas — added in quadrature to give achievable R. It will include reflectron mode, an optimum accelerating voltage finder and bottleneck identification. This mode is still in development.</p>
      </Section>
      <Section title="Definitions">
        <p className="text-sm text-muted-foreground">Definitions taken from the mass spectrometry Oxford chemistry primer, by James S.O. McCullagh and Neil J. Oldham.</p>
        <p>Resolving power is a measure of the ability of a mass analyser to provide a specified value of mass resolution.</p>
        <p>Resolution, or the separation of m/z values in a mass spectrum, is given by the ratio</p>
        <TeX block>{String.raw`R = \frac{m/z}{\Delta(m/z)}`}</TeX>
        <p>There are two different ways of working out resolving power in quadrupole mass filters:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>10% valley definition:</strong> defined by the separation in the m/z of two peak maxima of equal intensity resolved at 10% relative intensity.</li>
          <li><strong>FWHM:</strong> full peak width at half maximum intensity.</li>
        </ul>
        <p>It is important to determine which definition is being used, as the FWHM value of R will be twice that determined using the 10% valley definition.</p>
        <p>There are additional details such as Dawson's theoretical limit, which establishes the absolute mathematical ceiling for the mass resolution of an ideal quadrupole filter. I will add this detail later after studying it some more.</p>
      </Section>
      <Section title="Theory">
        <h3 className="font-serif text-xl text-foreground pt-2">FWHM and the 10% valley</h3>
        <p>With the FWHM definition the peak width is measured across one peak at half its maximum height:</p>
        <TeX block>{String.raw`R_{\text{FWHM}} = \frac{m}{\Delta m_{\text{FWHM}}}, \qquad \text{width (ppm)} = \frac{\Delta m}{m}\times 10^6`}</TeX>
        <p>For the 10% valley definition, two peaks of equal height are just resolved when the dip between them falls to 10% of the peak height. If both peaks are Gaussian with standard deviation σ, the valley sits halfway between the two maxima, so</p>
        <TeX block>{String.raw`2\exp\!\left(-\frac{d^2}{8\sigma^2}\right) = 0.1 \;\Rightarrow\; d = \sqrt{8\ln 20}\;\sigma = 4.896\,\sigma`}</TeX>
        <p>while one peak has <TeX>{String.raw`\Delta m_{\text{FWHM}} = 2\sqrt{2\ln 2}\;\sigma = 2.355\,\sigma`}</TeX>. The separation needed for a 10% valley is therefore</p>
        <TeX block>{String.raw`\frac{d}{\Delta m_{\text{FWHM}}} = \frac{\sqrt{8\ln 20}}{2\sqrt{2\ln 2}} = 2.079 \;\Rightarrow\; R_{10\%} \approx \frac{R_{\text{FWHM}}}{2}`}</TeX>
        <p>which is why the definition must always be stated alongside a resolving power.</p>

        <h3 className="font-serif text-xl text-foreground pt-2">Resolving power with m/z</h3>
        <p>Resolving power varies with m/z depending on the analyser: roughly constant for TOF, proportional to <TeX>{String.raw`1/\sqrt{m/z}`}</TeX> for Orbitrap, and proportional to <TeX>{String.raw`1/(m/z)`}</TeX> for FT-ICR.</p>

        <h3 className="font-serif text-xl text-foreground pt-2">Quadrupole: the flight-time ceiling</h3>
        <p>An ion with axial kinetic energy E_z travels the filter at</p>
        <TeX block>{String.raw`v_z = \sqrt{\frac{2E_z}{m}}`}</TeX>
        <p>where E_z is in joules (E_z [J] = e × E_z [eV]), so the number of RF cycles experienced inside the filter is</p>
        <TeX block>{String.raw`N = f\,t = \frac{f L}{v_z}`}</TeX>
        <p>Ions just outside the stability region need a finite number of cycles for their oscillation amplitude to grow to the rod, so a shorter stay accepts a wider band of m/z. When resolution is limited by residence time it follows R = Nⁿ/K with n ≈ 2; at the apex of stability zone 1 the simulations give</p>
        <TeX block>{String.raw`R_{\text{ideal}} = \frac{N^2}{10.9}`}</TeX>
        <p>in reasonable agreement with the earlier calculation of Paul et al. Real instruments fall short of this ceiling through field imperfections, misalignment, fringing fields and ion energy spread, so the calculator compares the ideal with a practical benchmark η·R_ideal that you set from your own instrument.</p>
        <p className="text-sm text-muted-foreground">Ref: S. U. A. H. Syed, T. J. Hogan, M. J. Antony Joseph, S. Maher, S. Taylor, <em>J. Am. Soc. Mass Spectrom.</em> 24 (2013) 1493–1500, <a href="https://doi.org/10.1007/s13361-013-0704-z" target="_blank" rel="noreferrer" className="underline">doi.org/10.1007/s13361-013-0704-z</a>; P. H. Dawson (ed.), <em>Quadrupole Mass Spectrometry and its Applications</em>, Elsevier (1976).</p>
      </Section>
    </>
  );
}
