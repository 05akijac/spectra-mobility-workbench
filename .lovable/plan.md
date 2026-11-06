# Instrumentation Tools Website — Plan

A plain, white, academic-style site. Every calculator runs in the visitor's browser, so nothing needs a server.

## Pages

- **Home** — welcome text, a list of tools you can use now, and a list of tools still being built (Proteomics marked "in development").
- **Top menu** with three dropdowns:
  - **Mass Spectrometry**: QMF RF/DC Calculator, RF Resonant Circuit, Ion Kinetic Energy, Vacuum Pressure Unit Converter, Vacuum Orifice Flow, Mean Free Path & Collision Frequency, Resolving Power
  - **Ion Mobility**: Mobility / Collision Cross Section (CCS) Converter
  - **Proteomics**: "Coming soon"
- **Each tool page** follows the same layout:
  1. The calculator: input boxes, units, and live results
  2. "How it works": what the tool does, step by step
  3. "Theory": the equations, shown with proper maths formatting, plus references

## Look

- White background, dark text, a serif font for headings and a clean sans font for body text, one muted blue accent colour
- Thin borders, no gradients, and a layout that works on phones

## How you build and edit it

- **In Lovable:** describe changes in chat (e.g. "add a Townsend's ion mobility tool"), or edit text directly in the Code view.
- **On GitHub:** connect GitHub in Project settings → Git. Lovable then keeps a repository in sync with the site. Any edit you make on GitHub or on your computer shows up back in Lovable.
- **Hosting on GitHub Pages:** the site is built as plain static pages. A ready-made GitHub Action builds it and publishes it to GitHub Pages every time you push. I'll include short setup steps in the README.
- **Adding a new tool later:** copy an existing tool page and update the formulas and text. Then add one line to the tool list, and it shows up in the menu and on the home page.

## Technical details

- One shared tool list (name, category, link, status) drives both the menus and the home page.
- Routes: `/mass-spec/<tool>`, `/ion-mobility/ccs`, `/proteomics`. Each route gets its own page title and description.
- Physics is kept in pure TypeScript modules with unit tests for key formulas: Mathieu a/q parameters, LC resonance \(f = 1/2\pi\sqrt{LC}\), mean free path \(\lambda = k_BT/\sqrt2\pi d^2p\), and the Mason–Schamp CCS equation.
- KaTeX renders the equations.
- All pages are prerendered to static HTML, with a base path setting so they work on GitHub Pages. A `.github/workflows/deploy.yml` file handles deployment.
