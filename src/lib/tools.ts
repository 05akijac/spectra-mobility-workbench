export type Category = "mass-spec" | "ion-mobility" | "proteomics";

export const CATEGORIES: { id: Category; name: string }[] = [
  { id: "mass-spec", name: "Mass Spectrometry" },
  { id: "ion-mobility", name: "Ion Mobility" },
  { id: "proteomics", name: "Proteomics" },
];

export type ToolInfo = {
  slug: string;
  category: Category;
  name: string;
  summary: string;
  status: "available" | "development";
};

// Add a line here to list a new tool in the menus and on the home page.
export const TOOLS: ToolInfo[] = [
  { slug: "qmf-rf-dc", category: "mass-spec", name: "QMF RF/DC Calculator", summary: "RF and DC voltages for a quadrupole mass filter from the Mathieu stability diagram.", status: "available" },
  { slug: "rf-resonant-circuit", category: "mass-spec", name: "RF Resonant Circuit", summary: "Resonant frequency of an LC tank, or the inductance needed for a target frequency.", status: "available" },
  { slug: "ion-kinetic-energy", category: "mass-spec", name: "Ion Kinetic Energy", summary: "Kinetic energy, velocity and flight time of an accelerated ion.", status: "available" },
  { slug: "pressure-converter", category: "mass-spec", name: "Vacuum Pressure Unit Converter", summary: "Convert between Pa, mbar, bar, Torr, atm and psi.", status: "available" },
  { slug: "orifice-flow", category: "mass-spec", name: "Vacuum Orifice Flow", summary: "Gas throughput through a thin orifice in viscous (choked) and molecular flow.", status: "available" },
  { slug: "mean-free-path", category: "mass-spec", name: "Mean Free Path & Collision Frequency", summary: "Mean free path, mean speed and collision frequency in a gas.", status: "available" },
  { slug: "resolving-power", category: "mass-spec", name: "Resolving Power", summary: "Resolving power from peak width, and the resolution needed to separate two masses.", status: "available" },
  { slug: "ccs-converter", category: "ion-mobility", name: "Mobility / CCS Converter", summary: "Convert reduced mobility K₀ to collision cross section with the Mason–Schamp equation.", status: "available" },
  { slug: "pending", category: "proteomics", name: "Proteomics tools", summary: "Peptide and protein tools are being developed.", status: "development" },
];

export const toolPath = (t: ToolInfo) => `/${t.category}/${t.slug}`;
export const findTool = (category: string, slug: string) =>
  TOOLS.find((t) => t.category === category && t.slug === slug && t.status === "available");
