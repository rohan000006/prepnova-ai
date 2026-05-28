---
name: Cinematic Intelligence
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1b1b'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#ccc3d8'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#303030'
  outline: '#958da1'
  outline-variant: '#4a4455'
  surface-tint: '#d2bbff'
  primary: '#d2bbff'
  on-primary: '#3f008e'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#732ee4'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#c8c6c5'
  on-tertiary: '#303030'
  tertiary-container: '#676666'
  on-tertiary-container: '#e7e5e4'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1b1c'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e2e2e2'
  surface-variant: '#353535'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.04em
  headline-xl:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

The design system is engineered to evoke a sense of high-performance intelligence and cinematic immersion. Aimed at ambitious professionals, the aesthetic balances the precision of developer tools with the premium feel of a luxury automotive interface. 

The style utilizes a **Modern-Cinematic** approach, blending deep obsidian surfaces with "light-leak" accents. It leverages high-contrast typography and hyper-precise borders to create a workspace that feels like a futuristic command center. The emotional goal is to instill confidence and focus, making the high-stakes environment of interview preparation feel like a controlled, elite simulation.

## Colors

The palette is anchored in absolute darkness to maximize depth and focus. 

- **Foundation**: Use `#000000` for the primary background to achieve a "true black" OLED effect.
- **Surfaces**: Use `#0A0A0B` for container backgrounds to provide a subtle lift from the base.
- **Accents**: Primary interactions utilize a vibrant Purple (`#7C3AED`) to Cyan (`#06B6D4`) gradient. 
- **Glows**: Interactive states should employ a 15-20% opacity Cyan glow (`#06B6D4`) to simulate active energy.
- **Borders**: All structural borders should use `#1F1F23`. Interactive borders may use a linear gradient from Slate to Primary Purple.

## Typography

This design system uses a dual-font strategy. **Geist** provides a technical, monospaced-adjacent precision for headings and UI labels, while **Inter** ensures maximum readability for long-form feedback and interview transcripts.

Tighten letter spacing on large displays to create a "compact-premium" look. Use uppercase styles for labels (`label-md`, `label-sm`) with increased letter spacing to enhance the futuristic, data-driven feel.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid** model. Content is centered within a 1440px max-width container for desktop, while internal elements utilize a strictly defined 4px baseline grid.

- **Desktop**: 12-column grid, 24px gutters, 64px side margins.
- **Tablet**: 8-column grid, 20px gutters, 32px side margins.
- **Mobile**: 4-column grid, 16px gutters, 20px side margins.

Maintain generous vertical breathing room between sections (80px+) to preserve the cinematic feel. Use "Precision Spacing"—where related elements are tightly grouped (4px, 8px) and distinct sections are widely separated—to create a clear visual hierarchy.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Glassmorphism**, rather than traditional drop shadows.

- **Layer 0 (Base)**: `#000000` (The void).
- **Layer 1 (Cards/Panels)**: `#0A0A0B` with a 1px solid border of `#1F1F23`.
- **Layer 2 (Overlays/Modals)**: Background blur (20px) with 60% opacity of the surface color.
- **Accents**: Use "Inner Glow" effects (1px, subtle cyan) on the top-left edge of primary cards to simulate a light source coming from the corner of the screen. 
- **Shadows**: When used for separation, shadows must be ultra-diffused, using large blur radii (40px+) with 0.4 opacity of pure black to avoid a "muddy" appearance.

## Shapes

The shape language is **Refined-Geometric**. A standard radius of 0.5rem (8px) is used for main components like input fields and small cards to maintain a sharp, professional edge. Larger dashboard widgets and containers utilize a 1rem (16px) radius to soften the layout and create a more approachable, modern feel. Buttons should remain consistent with the 8px standard unless they are "Action Pills," which use the full rounded-xl style.

## Components

### Buttons
- **Primary**: Gradient background (Purple to Blue), white text, and a subtle external Cyan outer glow on hover.
- **Secondary**: Transparent background, 1px border (`#1F1F23`), hover state transitions border to white.
- **Ghost**: No border, Slate-gray text, turns white on hover.

### Interactive Cards
- **3D-Tilt**: Cards should include a subtle scale-up (1.02x) and border-color shift to Cyan when hovered.
- **Backdrop**: Use a 1px gradient stroke that flows from top-left to bottom-right.

### Input Fields
- **Base**: Dark slate background, 1px border. 
- **Focus State**: Border transitions to Cyan with a 4px soft outer glow. Use monospaced font for technical input hints.

### Progress Rings
- **Visuals**: Use a dual-track system. A dark-gray base track with a glowing gradient foreground track. Add a "pulse" animation to the leading edge of the progress line.

### Dashboard Widgets
- **Header**: Small caps `label-sm` text with a thin separator line.
- **Background**: Slight glassmorphism effect (10px blur) to allow background gradients to bleed through subtly.