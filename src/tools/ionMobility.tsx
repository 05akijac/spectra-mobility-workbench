import { useState } from "react";
import { Calculator, Field, Section, TeX } from "@/components/ToolKit";
import * as P from "@/lib/physics";

export function CcsTool() {
  const [K0, setK0] = useState(1.0);
  const [ccsIn, setCcsIn] = useState(200);
  const [m, setM] = useState(500);
  const [mg, setMg] = useState(28.0134);
  const [z, setZ] = useState(1);
  const [T, setT] = useState(300);
  const ccs = P.ccsFromK0(K0 * 1e-4, m, mg, z, T) * 1e20;
  const k0 = P.k0FromCcs(ccsIn * 1e-20, m, mg, z, T) * 1e4;
  return (
    <>
      <Calculator
        inputs={<>
          <Field label="Reduced mobility K₀" unit="cm²/V·s" value={K0} onChange={setK0} />
          <Field label="CCS (for reverse conversion)" unit="Å²" value={ccsIn} onChange={setCcsIn} />
          <Field label="Ion mass" unit="Da" value={m} onChange={setM} />
          <Field label="Gas mass (N₂ 28.013, He 4.003)" unit="Da" value={mg} onChange={setMg} />
          <Field label="Charge z" value={z} onChange={setZ} step="1" />
          <Field label="Drift gas temperature" unit="K" value={T} onChange={setT} />
        </>}
        results={[
          ["CCS from K₀", `${P.fmt(ccs, 5)} Å²`],
          ["K₀ from CCS", `${P.fmt(k0, 5)} cm²/V·s`],
        ]}
      />
      <Section title="How it works">
        <p>Enter a reduced mobility (normalised to 273.15 K and 760 Torr) to get the collision cross section, or enter a CCS to get K₀. Make sure the ion mass, gas and temperature match your experiment.</p>
      </Section>
      <Section title="Theory">
        <p>The low-field Mason–Schamp equation links mobility to the momentum-transfer cross section:</p>
        <TeX block>{String.raw`\Omega = \frac{3ze}{16 N_0}\sqrt{\frac{2\pi}{\mu k_B T}}\;\frac{1}{K_0}, \qquad \mu = \frac{m\,M}{m+M}`}</TeX>
        <p>Here <TeX>{String.raw`N_0 = 2.687\times10^{25}\ \text{m}^{-3}`}</TeX> is the Loschmidt number. Reduced mobility comes from the measured mobility by</p>
        <TeX block>{String.raw`K_0 = K\,\frac{p}{760\ \text{Torr}}\,\frac{273.15\ \text{K}}{T}`}</TeX>
        <p className="text-sm text-muted-foreground">Ref: E. A. Mason &amp; E. W. McDaniel, <em>Transport Properties of Ions in Gases</em>, Wiley (1988).</p>
      </Section>
    </>
  );
}
