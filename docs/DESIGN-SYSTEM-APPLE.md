# 🍎 Apple-Inspired Design System

## Design Philosophy

**Minimalism | Clarity | Premium**

Inspired by Apple's design language: clean, professional, with generous white space and subtle, purposeful interactions.

---

## 🎨 Color Palette

### Light Theme (Primary)

#### Background Colors
- **Primary Background:** `#FFFFFF` (Pure White)
- **Secondary Background:** `#F5F5F7` (Light Gray)
- **Tertiary Background:** `#E8E8ED` (Medium Gray)
- **Elevated Surface:** `#FFFFFF` with subtle shadow

#### Text Colors
- **Primary Text:** `#1D1D1F` (Almost Black)
- **Secondary Text:** `#86868B` (Medium Gray)
- **Tertiary Text:** `#D2D2D7` (Light Gray)
- **Link Text:** `#007AFF` (Apple Blue)

#### Accent Colors
- **Primary Accent:** `#007AFF` (Apple Blue)
- **Success:** `#34C759` (Apple Green)
- **Warning:** `#FF9500` (Apple Orange)
- **Error:** `#FF3B30` (Apple Red)
- **Info:** `#5856D6` (Apple Purple)

#### System Colors
- **SEV1:** `#FF3B30` (Critical Red)
- **SEV2:** `#FF9500` (Warning Orange)
- **SEV3:** `#FFCC00` (Caution Yellow)
- **SEV4:** `#34C759` (Success Green)

### Dark Theme (Optional)

#### Background Colors
- **Primary Background:** `#000000` (True Black)
- **Secondary Background:** `#1C1C1E` (Dark Gray)
- **Tertiary Background:** `#2C2C2E` (Medium Gray)
- **Elevated Surface:** `#1C1C1E` with subtle glow

#### Text Colors
- **Primary Text:** `#FFFFFF` (White)
- **Secondary Text:** `#98989D` (Light Gray)
- **Tertiary Text:** `#48484A` (Dark Gray)

---

## 📐 Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 
             'Helvetica Neue', 'Segoe UI', 'Inter', system-ui, sans-serif;
```

### Type Scale

#### Display (Hero Text)
- **Size:** 56px / 3.5rem
- **Weight:** 700 (Bold)
- **Line Height:** 1.1
- **Letter Spacing:** -0.02em
- **Use:** Landing page heroes, major headings

#### Heading 1
- **Size:** 40px / 2.5rem
- **Weight:** 700 (Bold)
- **Line Height:** 1.2
- **Letter Spacing:** -0.01em
- **Use:** Page titles

#### Heading 2
- **Size:** 32px / 2rem
- **Weight:** 600 (Semibold)
- **Line Height:** 1.25
- **Letter Spacing:** -0.01em
- **Use:** Section headings

#### Heading 3
- **Size:** 24px / 1.5rem
- **Weight:** 600 (Semibold)
- **Line Height:** 1.3
- **Use:** Card titles, subsections

#### Heading 4
- **Size:** 20px / 1.25rem
- **Weight:** 600 (Semibold)
- **Line Height:** 1.4
- **Use:** List headers

#### Body Large
- **Size:** 17px / 1.0625rem
- **Weight:** 400 (Regular)
- **Line Height:** 1.5
- **Use:** Primary content

#### Body (Default)
- **Size:** 15px / 0.9375rem
- **Weight:** 400 (Regular)
- **Line Height:** 1.5
- **Use:** Standard text

#### Body Small
- **Size:** 13px / 0.8125rem
- **Weight:** 400 (Regular)
- **Line Height:** 1.4
- **Use:** Captions, metadata

#### Caption
- **Size:** 11px / 0.6875rem
- **Weight:** 400 (Regular)
- **Line Height:** 1.3
- **Use:** Footnotes, timestamps

---

## 📦 Spacing System

Apple uses 4px base unit (0.25rem)

```
4px   (0.25rem)  - xs   - Tight spacing
8px   (0.5rem)   - sm   - Small spacing
12px  (0.75rem)  - base - Default spacing
16px  (1rem)     - md   - Medium spacing
24px  (1.5rem)   - lg   - Large spacing
32px  (2rem)     - xl   - Extra large spacing
48px  (3rem)     - 2xl  - Section spacing
64px  (4rem)     - 3xl  - Major section spacing
96px  (6rem)     - 4xl  - Hero spacing
```

---

## 🔲 Border Radius

```
2px   (0.125rem) - xs   - Subtle rounding
4px   (0.25rem)  - sm   - Small elements
8px   (0.5rem)   - base - Buttons, inputs
12px  (0.75rem)  - md   - Cards
16px  (1rem)     - lg   - Large cards
20px  (1.25rem)  - xl   - Modals
24px  (1.5rem)   - 2xl  - Hero elements
```

---

## 🌑 Shadows & Elevation

### Subtle Elevation (Cards)
```css
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
```

### Medium Elevation (Dropdowns)
```css
box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
```

### High Elevation (Modals)
```css
box-shadow: 0 12px 48px 0 rgba(0, 0, 0, 0.16);
```

---

## 🎭 Components

### Buttons

#### Primary Button
- **Background:** `#007AFF`
- **Text:** `#FFFFFF`
- **Padding:** `12px 24px`
- **Border Radius:** `8px`
- **Font Weight:** 600
- **Hover:** Slightly darker blue
- **Active:** Scale 0.98

#### Secondary Button
- **Background:** `#F5F5F7`
- **Text:** `#1D1D1F`
- **Padding:** `12px 24px`
- **Border Radius:** `8px`
- **Hover:** `#E8E8ED`

#### Tertiary Button
- **Background:** Transparent
- **Text:** `#007AFF`
- **Padding:** `12px 24px`
- **Hover:** `#F5F5F7`

### Cards
- **Background:** `#FFFFFF`
- **Border:** None
- **Shadow:** Subtle elevation
- **Border Radius:** `12px`
- **Padding:** `24px`
- **Hover:** Lift slightly with deeper shadow

### Input Fields
- **Background:** `#FFFFFF`
- **Border:** `1px solid #D2D2D7`
- **Border Radius:** `8px`
- **Padding:** `12px 16px`
- **Font Size:** `15px`
- **Focus:** Blue border `#007AFF`

### Tables
- **Header Background:** `#F5F5F7`
- **Row Hover:** `#F5F5F7`
- **Border:** `1px solid #E8E8ED`
- **No vertical borders**
- **Generous padding:** `16px`

### Badges
- **Border Radius:** `16px` (pill shape)
- **Padding:** `4px 12px`
- **Font Size:** `13px`
- **Font Weight:** 600
- **SEV1:** Red background with white text
- **SEV2:** Orange background with white text
- **SEV3:** Yellow background with dark text
- **SEV4:** Green background with white text

---

## ✨ Animations

### Timing Functions
```css
/* Standard easing - most interactions */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Smooth easing - modals, large movements */
transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);

/* Sharp easing - quick feedback */
transition-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
```

### Duration
- **Fast:** 150ms - Hover states, small changes
- **Normal:** 250ms - Button clicks, toggles
- **Slow:** 350ms - Page transitions, modals

### Micro-interactions
- Button press: Scale to 0.98
- Card hover: Translate Y -2px + deeper shadow
- Input focus: Border color change + subtle glow

---

## 📱 Responsive Breakpoints

```
xs:  0px    - Mobile (portrait)
sm:  640px  - Mobile (landscape)
md:  768px  - Tablet
lg:  1024px - Desktop
xl:  1280px - Large desktop
2xl: 1536px - Extra large
```

---

## 🎯 Layout Principles

### Generous White Space
- Minimum 48px between major sections
- Minimum 24px between related elements
- Minimum 16px between UI components

### Grid System
- **Max Width:** 1280px for content
- **Padding:** 24px on mobile, 48px on desktop
- **Columns:** 12-column grid system

### Visual Hierarchy
1. **Primary Action:** Blue button, prominent
2. **Secondary Actions:** Gray buttons
3. **Tertiary Actions:** Text links
4. **Destructive Actions:** Red button

---

## 📋 Usage Examples

### Page Header
```
┌─────────────────────────────────────────────┐
│  Large Title (40px, Bold)                   │
│  Subtitle (17px, Regular, Gray)             │
│                                              │
│  [Primary Button]  [Secondary Button]       │
└─────────────────────────────────────────────┘
```

### Card Layout
```
┌─────────────────────────────────────────────┐
│  ╭─────────────────────────────────────────╮│
│  │                                          ││
│  │  Card Title (24px, Semibold)            ││
│  │  Card description (15px, Regular, Gray)  ││
│  │                                          ││
│  │  Content goes here...                    ││
│  │                                          ││
│  ╰─────────────────────────────────────────╯│
└─────────────────────────────────────────────┘
```

### Data Table
```
╔═══════════════════════════════════════════════╗
║ Column 1       Column 2       Column 3        ║
╠═══════════════════════════════════════════════╣
║ Data 1         Data 2         Data 3          ║
║ Data 1         Data 2         Data 3          ║
║ Data 1         Data 2         Data 3          ║
╚═══════════════════════════════════════════════╝
```

---

## 🎨 Semantic Colors

### Status Colors
- **Operational:** `#34C759` (Green)
- **Degraded:** `#FF9500` (Orange)
- **Outage:** `#FF3B30` (Red)
- **Maintenance:** `#5856D6` (Purple)

### Priority Colors
- **Critical:** `#FF3B30`
- **High:** `#FF9500`
- **Medium:** `#FFCC00`
- **Low:** `#34C759`

---

## ✅ Do's

✅ Use generous white space  
✅ Keep interfaces clean and uncluttered  
✅ Use subtle shadows for depth  
✅ Ensure high contrast for readability  
✅ Use smooth, purposeful animations  
✅ Maintain consistent spacing  
✅ Use system fonts  
✅ Keep navigation simple  

## ❌ Don'ts

❌ Overuse colors  
❌ Clutter the interface  
❌ Use heavy shadows  
❌ Use too many font weights  
❌ Create slow animations  
❌ Use bright, saturated colors  
❌ Overcomplicate navigation  
❌ Ignore white space  

---

**This design system creates a premium, professional feel that users will love!** 🍎
