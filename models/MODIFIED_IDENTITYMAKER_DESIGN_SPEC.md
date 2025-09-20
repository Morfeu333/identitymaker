# 🎨 **IDENTITYMAKER DESIGN SYSTEM SPECIFICATION - FUTURISTIC DARK MODE**
## *Cybernetic Blueprint Visual Design Language*

---

## **DESIGN PHILOSOPHY**

### **"Futuristic Dark Mode" Theme**
The IdentityMaker design system is being transformed into a "Futuristic Dark Mode" aesthetic. This design embodies a modern, tech-centric feel, characterized by a deep navy/blue background, vibrant, glowing cyan accents, and sharp yellow highlights. The goal is to create an interface that feels immersive, energetic, and cutting-edge, suitable for a forward-thinking application.

### **Design Principles**
1.  **Clarity**: High-contrast elements on a dark background ensure readability and focus.
2.  **Consistency**: A unified visual language across all touchpoints.
3.  **Accessibility**: High-contrast ratios and clear focus states are prioritized.
4.  **Energy**: Glowing effects and vibrant accents create a dynamic user experience.
5.  **Precision**: Pixel-perfect implementation with sharp details and clean lines.

---

## **🎯 COLOR SYSTEM**

### **Primary Palette - "Cybernetic Blueprint"**
```css
/* Base Theme Colors (Dark Mode) */
:root {
  --background: 215 25% 9%;          /* #10151f - Deep Navy */
  --foreground: 0 0% 95%;            /* #f2f2f2 - Light Gray Text */

  --card: 215 25% 11%;               /* #1a1e2b - Dark Blue Card */
  --card-foreground: 0 0% 95%;       /* #f2f2f2 - Light Gray Text */

  --popover: 215 25% 11%;            /* #1a1e2b */
  --popover-foreground: 0 0% 95%;    /* #f2f2f2 */

  /* Primary Accent (Cyan) */
  --primary: 191 100% 50%;           /* #00d3ff - Vibrant Cyan */
  --primary-foreground: 215 25% 9%;  /* #10151f - Dark text for high contrast on cyan */

  /* Secondary Accent (Yellow) */
  --secondary: 45 98% 62%;           /* #fecb38 - Bright Yellow */
  --secondary-foreground: 215 25% 9%;/* #10151f - Dark text for high contrast on yellow */

  /* Muted Colors */
  --muted: 215 25% 25%;              /* #333c4d */
  --muted-foreground: 0 0% 63%;      /* #a0a0a0 - Medium Gray */

  /* General Accent (Used for hovers, etc.) */
  --accent: 215 25% 15%;             /* #202633 */
  --accent-foreground: 0 0% 95%;     /* #f2f2f2 */

  /* Semantic Colors */
  --destructive: 350 90% 60%;        /* #f64c63 - Vibrant Red */
  --destructive-foreground: 0 0% 95%;/* #f2f2f2 */
  --warning: 45 98% 62%;             /* #fecb38 - Bright Yellow */
  --warning-foreground: 215 25% 9%;  /* #10151f */

  /* Border & Input System */
  --border: 215 25% 20%;             /* #293040 */
  --input: 215 25% 15%;              /* #202633 */
  --ring: 191 100% 50%;              /* #00d3ff - Cyan focus ring */

  /* Radius */
  --radius: 0.5rem;
}
```

---

## **📝 TYPOGRAPHY SYSTEM**

### **Font Stack**
```css
/* Import in your main CSS file (e.g., index.css) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

/* Apply in your tailwind.config.ts */
font-family: 'Inter', sans-serif;
```

### **Type Scale & Hierarchy**
The existing type scale is well-structured and can be maintained. The change in font and color will provide the desired aesthetic shift.

---

## **🌟 SHADOW SYSTEM**

### **Elevation Hierarchy with Glow Effects**
```css
/* Futuristic Glow Shadows */
--shadow-card: 0 0 15px hsl(var(--primary) / 0.2);
--shadow-button: 0 0 10px hsl(var(--primary) / 0.4);
--shadow-glow-lg: 0 0 25px hsl(var(--primary) / 0.3);
--shadow-glow-md: 0 0 15px hsl(var(--primary) / 0.2);
--shadow-glow-sm: 0 0 8px hsl(var(--primary) / 0.15);

/* Standard Shadow Scale (for subtle depth) */
.shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
.shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1); }
```

### **Interactive Shadows**
```css
/* Hover States */
.card-interactive:hover {
  box-shadow: var(--shadow-glow-md);
  border-color: hsl(var(--primary) / 0.5);
}

.button-primary:hover {
  box-shadow: var(--shadow-glow-lg);
}

/* Focus States */
.input:focus-visible {
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0.3);
  border-color: hsl(var(--ring));
}
```

---

## **🎨 GRADIENT SYSTEM**

### **Brand Gradients**
```css
/* Futuristic Gradients */
--gradient-hero: linear-gradient(135deg, hsl(215 25% 12%), hsl(215 25% 9%));
--gradient-card: linear-gradient(145deg, hsl(215 25% 15%), hsl(215 25% 11%));
--gradient-button: linear-gradient(135deg, hsl(var(--primary)), hsl(191 100% 60%));
```

---

## **🔧 IMPLEMENTATION GUIDELINES**

### **1. CSS Custom Properties Setup (`src/index.css`)**
Replace the existing `:root` and `.dark` blocks with this single block.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

@layer base {
  :root {
    --background: 215 25% 9%;
    --foreground: 0 0% 95%;
    --card: 215 25% 11%;
    --card-foreground: 0 0% 95%;
    --popover: 215 25% 11%;
    --popover-foreground: 0 0% 95%;
    --primary: 191 100% 50%;
    --primary-foreground: 215 25% 9%;
    --secondary: 45 98% 62%;
    --secondary-foreground: 215 25% 9%;
    --muted: 215 25% 25%;
    --muted-foreground: 0 0% 63%;
    --accent: 215 25% 15%;
    --accent-foreground: 0 0% 95%;
    --destructive: 350 90% 60%;
    --destructive-foreground: 0 0% 95%;
    --warning: 45 98% 62%;
    --warning-foreground: 215 25% 9%;
    --border: 215 25% 20%;
    --input: 215 25% 15%;
    --ring: 191 100% 50%;
    --radius: 0.5rem;
  }

  @layer base {
    * {
      @apply border-border;
    }
    body {
      @apply bg-background text-foreground;
    }
  }
}
```

### **2. Tailwind Configuration (`tailwind.config.ts`)**
Update your `tailwind.config.ts` to use the new variables and add the custom glow shadows.

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'card-glow': '0 0 15px hsl(var(--primary) / 0.2)',
        'button-glow': '0 0 10px hsl(var(--primary) / 0.4)',
        'glow-lg': '0 0 25px hsl(var(--primary) / 0.3)',
        'glow-md': '0 0 15px hsl(var(--primary) / 0.2)',
        'glow-sm': '0 0 8px hsl(var(--primary) / 0.15)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

### **3. Component Usage Example (`button.tsx`)**
The `default` variant should be updated to reflect the primary action color (cyan).

```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  "... ",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-button-glow",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // ... other variants
      },
    // ...
    },
  }
)
```
