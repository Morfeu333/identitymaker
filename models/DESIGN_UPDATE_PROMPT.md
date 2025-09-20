# **Agent Prompt: Apply "Futuristic Dark Mode" Design to IdentityMaker**

## **Objective**
Your task is to update the visual design of the `identitymaker-deploy` React application. You will replace the current warm, earthy design with a new "Futuristic Dark Mode" aesthetic. 

## **Source of Truth**
All design tokens, color values, and configuration changes are specified in the **`MODIFIED_IDENTITYMAKER_DESIGN_SPEC.md`** document. This is your primary reference and single source of truth.

## **Visual Guide**
For a clear visual reference of the target design, consult the static HTML file **`finaldesign.html`** located in the root directory. This file provides a concrete example of component styling, layout, and overall aesthetic.

---

## **Step-by-Step Implementation Plan**

### **Step 1: Backup Existing Configuration**
Before making any changes, create backups of the following two files in the `identitymaker-deploy` directory:
- `identitymaker-deploy/src/index.css`
- `identitymaker-deploy/tailwind.config.ts`

### **Step 2: Update CSS Variables and Base Styles**
1.  Open `identitymaker-deploy/src/index.css`.
2.  Delete the existing `@layer base` block containing the `:root` and `.dark` theme definitions.
3.  Copy the entire CSS block from the `IMPLEMENTATION GUIDELINES > 1. CSS Custom Properties Setup` section of `MODIFIED_IDENTITYMAKER_DESIGN_SPEC.md`.
4.  Paste this new block into `identitymaker-deploy/src/index.css`. This will import the 'Inter' font and set up all the new color variables for the dark theme.

### **Step 3: Update Tailwind Configuration**
1.  Open `identitymaker-deploy/tailwind.config.ts`.
2.  Replace the entire `theme` object with the `theme` object provided in the `IMPLEMENTATION GUIDELINES > 2. Tailwind Configuration` section of `MODIFIED_IDENTITYMAKER_DESIGN_SPEC.md`.
3.  Ensure the `fontFamily` and `boxShadow` extensions are correctly added.

### **Step 4: Verify UI Component Variants**
1.  Navigate to `identitymaker-deploy/src/components/ui/`.
2.  Inspect key component files, especially `button.tsx`.
3.  Check the `cva` (class-variance-authority) variants.
4.  Ensure the `default` variant now uses `bg-primary text-primary-foreground` and includes the new `shadow-button-glow` class to match the new design's primary action style.
5.  Adjust other variants as necessary if they have conflicting styles.

### **Step 5: Apply Global Background and Text Color**
1.  Open the main layout file for the application (likely `identitymaker-deploy/src/App.tsx` or a similar layout component).
2.  Ensure the root element of your application (e.g., the main `<div>` or `<body>`) has the classes `bg-background text-foreground`.
    - **Note:** The new `index.css` already applies this to the `body` tag, but it's good practice to confirm it's taking effect.

### **Step 6: Final Review and Refinement**
1.  Run the development server for the `identitymaker-deploy` application.
2.  Thoroughly browse through all pages, components, and user flows.
3.  Visually inspect for any elements that still have the old brown/white theme.
4.  Use your browser's developer tools to identify the source of the old styles and replace them with the appropriate Tailwind utility classes from the new design system (e.g., `bg-card`, `border-border`, `shadow-card-glow`).
5.  Pay special attention to cards, buttons, inputs, and backgrounds to ensure they all conform to the new "Futuristic Dark Mode" aesthetic.
