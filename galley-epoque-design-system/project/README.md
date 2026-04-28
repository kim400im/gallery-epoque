# Galley Epoque — Design System

## Company Overview

**Galley Epoque** is a premium online art gallery and picture marketplace. The platform has two key user roles:

- **Admin** — uploads and curates pictures for exhibition
- **Visitors/Buyers** — browse the gallery, purchase artwork, or contact the gallery to buy

The experience is meant to feel like stepping into a refined, modern art gallery — elevated, serene, and trustworthy.

**No external codebase or Figma file was provided.** This design system was built from the brand description alone.

---

## Products / Surfaces

1. **Gallery Website** — Public-facing homepage, gallery grid, artwork detail pages, contact/purchase flow
2. *(Future)* **Admin Dashboard** — Upload, manage, and curate artwork listings

---

## CONTENT FUNDAMENTALS

### Voice & Tone
- **Refined and confident** — speaks like a knowledgeable gallerist, not a salesperson
- **First person** when speaking as the gallery ("We curate…"), second person to address visitors ("Discover your next…")
- **No exclamation marks** — restraint signals luxury
- **No emoji** — this is a gallery, not a social feed
- **Sentence case** for body copy; **Title Case** for artwork titles and navigation labels
- **Short, evocative sentences** — "Each piece tells a story." Not "Browse our amazing collection of amazing art!"
- **Numbers under ten** spelled out ("three works"), larger as numerals
- **Examples of good copy:**
  - "Curated with intention. Available for your walls."
  - "Original works. Signed and certified."
  - "Contact us to arrange viewing or purchase."
  - "Every photograph begins as a moment."

---

## VISUAL FOUNDATIONS

### Color
- **Primary Green** `#1A4D2E` — deep forest green; authority, nature, permanence
- **Light Green** `#4A7C59` — mid-tone green for hover/secondary uses
- **Accent Green** `#7FB069` — bright accent for highlights, badges
- **Cream / Off-White** `#F7F4EF` — warm background, softer than pure white
- **Pure White** `#FFFFFF` — card surfaces, image mats
- **Ink Black** `#1A1A18` — primary text
- **Warm Gray** `#8C8679` — secondary text, captions
- **Gold** `#C9A84C` — premium accent, price tags, borders on featured works

### Typography
- **Display**: *Cormorant Garamond* — elegant serif, used for headlines and artwork titles (Google Fonts)
- **Body**: *Jost* — clean geometric sans-serif for UI text, descriptions, navigation (Google Fonts)
- **Mono**: *JetBrains Mono* — metadata, catalog numbers, edition info

### Backgrounds
- Cream (`#F7F4EF`) as page background — never pure white
- White mat on artwork cards (like a physical mat board)
- Full-bleed photography sections with dark green overlay gradient
- Subtle noise texture (3% opacity) on hero sections for warmth

### Animation
- **Easing**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` — smooth, slightly decelerated (gallery-appropriate)
- **Duration**: 200ms for micro-interactions, 400ms for page-level reveals
- **Entrance**: fade-up (opacity + translateY 12px → 0) for cards
- **No bounces** — reserved, measured motion only
- **Hover on artwork cards**: image gently scales to 1.04x over 400ms

### Hover & Press States
- Buttons: darken bg by ~10%; no opacity changes
- Links: underline appears (not color change)
- Cards: slight shadow elevation + 1.04 image zoom
- Nav items: left border 2px green appears

### Borders & Radius
- **Cards**: `border-radius: 2px` — nearly square, gallery-frame feel
- **Buttons**: `border-radius: 2px`
- **Inputs**: `border-radius: 2px`
- **Pill badges**: `border-radius: 999px`
- Borders: `1px solid` using `--color-border: #E0DDD7`
- Featured artwork: gold border `1px solid #C9A84C`

### Shadows & Elevation
- **Resting card**: `box-shadow: 0 2px 8px rgba(26,26,24,0.08)`
- **Hover card**: `box-shadow: 0 8px 24px rgba(26,26,24,0.14)`
- **Modal/overlay**: `box-shadow: 0 24px 64px rgba(26,26,24,0.22)`
- No colored shadows

### Spacing Scale (8pt grid)
`4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192px`

### Imagery
- **Color vibe**: warm-toned, slightly desaturated — feels like analog photography
- Artworks always shown with a white mat border (padding inside the card)
- Hero images use a dark green gradient overlay for text legibility
- No stock-photo style imagery — authentic, artistic

### Layout
- Max content width: `1280px`
- Gallery grid: responsive CSS grid, 3–4 columns desktop, 2 tablet, 1 mobile
- Section padding: `96px 0` desktop, `64px 0` mobile
- Navigation: sticky top bar, white background, 1px bottom border

### Iconography
- Uses **Lucide Icons** (CDN) — stroke-based, 1.5px stroke weight, rounded caps
- No filled icons — consistent with gallery refinement
- Icon sizes: 16px (inline), 20px (UI actions), 24px (feature icons)
- No emoji used anywhere

---

## ICONOGRAPHY

Icons are sourced from **Lucide Icons** (`https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`). This is a stroke-based icon system with 1.5px stroke weight and rounded line caps — clean and elegant.

Key icons used:
- `search` — gallery search
- `shopping-bag` — purchase/cart
- `heart` — save/wishlist
- `mail` — contact
- `chevron-right` / `arrow-right` — navigation
- `zoom-in` — artwork detail view
- `upload` — admin upload
- `grid` / `layout-grid` — gallery view toggle
- `user` — admin login

No proprietary icon font or SVG sprite was provided. Lucide is the canonical substitute.

---

## FILES INDEX

```
README.md                          ← This file
SKILL.md                           ← Agent skill definition
colors_and_type.css                ← CSS custom properties (colors, type, spacing)
assets/
  logo.svg                         ← Galley Epoque logotype (SVG)
  logo-white.svg                   ← White version for dark backgrounds
  logo-mark.svg                    ← Mark/monogram only
preview/
  colors-primary.html              ← Primary color swatches
  colors-neutral.html              ← Neutral / gray scale swatches
  colors-semantic.html             ← Semantic color tokens
  type-display.html                ← Display type specimens
  type-body.html                   ← Body + UI type specimens
  type-scale.html                  ← Full type scale
  spacing-tokens.html              ← Spacing scale
  shadows-radii.html               ← Shadow + radius tokens
  components-buttons.html          ← Button variants
  components-cards.html            ← Artwork card variants
  components-nav.html              ← Navigation bar
  components-badges.html           ← Badges and tags
  components-form.html             ← Form inputs
  brand-logo.html                  ← Logo usage
ui_kits/
  website/
    README.md
    index.html                     ← Full website prototype
    Header.jsx
    HeroSection.jsx
    GalleryGrid.jsx
    ArtworkCard.jsx
    ArtworkDetail.jsx
    ContactSection.jsx
    Footer.jsx
```
