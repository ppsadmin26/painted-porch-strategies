# Memory: style/brand-color-guidelines
Updated: now

## Primary Brand Colors

| Usage | Color | CSS Classes |
|-------|-------|-------------|
| General brand/navigation | Teal | `text-primary`, `bg-primary` |
| Blue Door buttons/text | Cobalt | `text-bluedoor`, `bg-bluedoor` |

## The Painted Porch Pillars™ Color System

A cool → warm temperature gradient representing the journey from structural abstraction to human warmth:

| Pillar | Color | Hex | CSS Variable | Card BG | Psychology |
|--------|-------|-----|--------------|---------|------------|
| **Cultural Cornerstone** | Navy | #00006B | `--navy` | `bg-[hsl(220,60%,95%)]` | Deep, authoritative, stable - "The Blueprint" |
| **Operational Frame** | Purple | #523387 | `--strategic` | `bg-strategic/10` | Wisdom, strategic depth - "The Framework" |
| **Living Ecosystem** | Gold | #E8A231 | `--gold` | `bg-gold/10` | Warm, human value, potential - "Human Capacity" |

### Pillar Details

**Cultural Cornerstone — Navy**
- Hex: #00006B | HSL: 240 100% 21%
- Card Background: `bg-[hsl(220,60%,95%)]` (cool blue-tinted)
- Icon Background: `bg-[hsl(220,50%,90%)]`
- Represents: Systems, processes, frameworks—the foundation everything else builds upon

**Operational Frame — Purple (Strategic)**
- Hex: #523387 | HSL: 263 44% 36%
- Card Background: `bg-strategic/10`
- Icon Background: `bg-strategic/15`
- Represents: The "wise advisor"—bridges analytical (blue undertones) and innovative (red undertones)

**Living Ecosystem — Gold**
- Hex: #E8A231 | HSL: 40 81% 55%
- Card Background: `bg-gold/10`
- Icon Background: `bg-gold/15`
- Represents: Human development and unlocking potential—the only warm color among the three

## Partnership Tier Colors & Icons (P.A.T.H. Hub)

| Tier | Color | Hex | CSS Variable | Icon | Lucide Icon |
|------|-------|-----|--------------|------|-------------|
| **IGNITE** | Gold | #E8A231 | `--gold` | 🔥 | `Flame` |
| **AMPLIFY** | Purple (Strategic) | #523387 | `--strategic` | ✨ | `Sparkles` |
| **EMBODY** | Navy | #00006B | `--navy` | 🏛️ | `Landmark` |

**Icon Psychology:**
- **Flame (IGNITE):** Spark, clarity, individual insight - lighting the fire of transformation
- **Sparkles (AMPLIFY):** Radiant energy, burst, momentum - amplifying impact through workshops
- **Landmark (EMBODY):** Architecture, permanence, foundation - building unshakeable structures
**Universal Brand Color:** Teal (#007697 / `--primary`) for non-tier-specific elements and CTAs.

## Button Styling Standards

### Solid Buttons
- Always use **white text** (`text-white`)
- Exception: White background buttons use **navy text** (`text-navy`) for contrast
- Include matching 2px border for consistent sizing with outline variants

### Outline Buttons (Inverse of Solid)
- **Transparent background** with **colored border and text** matching the tier/brand color
- Text and border color should match (e.g., gold border + gold text)
- On hover: transition to solid version (filled background, white text)

### Button Pairs Pattern
For each brand color, the solid and outline variants are inverses:

| Color | Solid Button | Outline Button |
|-------|--------------|----------------|
| **Gold** | `bg-gold border-gold text-white` | `bg-transparent border-gold text-gold` |
| **Strategic** | `bg-strategic border-strategic text-white` | `bg-transparent border-strategic text-strategic` |
| **Navy** | `bg-navy border-navy text-white` | `bg-transparent border-navy text-navy` |
| **Primary (Teal)** | `bg-primary border-primary text-white` | `bg-transparent border-primary text-primary` |
| **White** | `bg-white border-white text-navy` | `bg-transparent border-white text-white` |

### Hover Behavior

**On Light Backgrounds (white, muted, light tints):**
- **Solid → Outline:** `hover:bg-transparent hover:text-[color]`
- **Outline → Solid:** `hover:bg-[color] hover:text-white`

**On Dark Backgrounds (navy, strategic gradient, dark sections):**
- **Solid → White:** `hover:bg-white hover:text-[color]` (inverts to white for visibility)
- **Outline (white):** `bg-transparent border-white text-white hover:bg-white hover:text-navy`

### Context Examples
```tsx
// Light background - solid button inverts to outline
<Button className="bg-primary border-2 border-primary text-white hover:bg-transparent hover:text-primary">

// Dark background - solid button inverts to white  
<Button className="bg-primary border-2 border-primary text-white hover:bg-white hover:text-primary">

// Dark background - outline button (white) fills to white
<Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-navy">
```

### Additional Standards
- All buttons: 8px rounded corners (`rounded-lg`)
- Include `border-2` on all buttons for consistent sizing
- Hover scale: 1.02x for emphasis (optional)
- Transition: `transition-colors` for smooth state changes

### Raspberry (Bold Emphasis)
- Hex: #DB0043 | HSL: 342 100% 43%
- CSS Variable: `--raspberry` / `text-raspberry`
- Usage:
  - "IF" in "ShIFt" typography when emphasizing action/urgency
  - "Painted Porch Pillars™" trademark text
  - "Not For" lists and cautionary content
  - Sparingly for urgency

### Lime (Positive Indicators)
- Hex: #70A300 | HSL: 77 100% 32%
- CSS Variable: `--lime` / `text-lime`
- Usage:
  - "For" lists and positive indicators
  - Secondary highlights
  - Success states

### Coral (Occasional)
- For occasional warm accent use

### Jewel Teal (Occasional)
- Deeper, jewel-toned teal for occasional use

## Typography Color Patterns

### "ShIFt" Pattern
- Base text: Inherit from parent
- "IF" accent: Use `text-bluedoor` for Blue Door context, or `text-raspberry` for action emphasis
- Example: `Sh<span className="font-bold text-raspberry">IF</span>t`

### "Blue Door" Text Pattern
- Always bold: `font-bold`
- Color: `text-bluedoor` (cobalt)
- Example: `<span className="font-bold text-bluedoor">Blue Door Diagnostic</span>`

### "What IF" Pattern
- "What" and "?" in base color
- "IF" in `text-bluedoor` (cobalt)
- Example: `What <span className="font-bold text-bluedoor">IF</span>...?`

## Complete Brand Palette

| Color | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Teal Blue | #007697 | `--primary` | Primary CTAs, links, universal brand |
| Cobalt (Blue Door) | #0047AB | `--bluedoor` | Blue Door specific elements |
| Navy | #00006B | `--navy` | Headers, navigation, Pillar 1, EMBODY tier |
| Strategic Purple | #523387 | `--strategic` | Pillar 2, AMPLIFY tier |
| Gold | #E8A231 | `--gold` | Pillar 3, IGNITE tier, warm accents |
| Lime Green | #70A300 | `--lime` | Positive indicators, success states |
| Raspberry | #DB0043 | `--raspberry` | Bold emphasis, "Not For" lists, urgency |
| Charcoal Gray | #545454 | `--foreground` | Body text |
| White | #FFFFFF | `--background` | Backgrounds |
