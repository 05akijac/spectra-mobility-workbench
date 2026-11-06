import type { ComponentType } from "react";
import * as MS from "./massSpec";
import { CcsTool } from "./ionMobility";

// Maps a tool slug (from src/lib/tools.ts) to its page content.
export const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "qmf-rf-dc": MS.QmfTool,
  "rf-resonant-circuit": MS.LcTool,
  "ion-kinetic-energy": MS.KeTool,
  "pressure-converter": MS.PressureTool,
  "orifice-flow": MS.OrificeTool,
  "mean-free-path": MS.MfpTool,
  "resolving-power": MS.ResolvingTool,
  "ccs-converter": CcsTool,
};
