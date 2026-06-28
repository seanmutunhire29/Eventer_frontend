---
name: Lumina Campus
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#3f4941'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#6f7a71'
  outline-variant: '#bec9bf'
  surface-tint: '#086c41'
  primary: '#004e2d'
  on-primary: '#ffffff'
  primary-container: '#00693e'
  on-primary-container: '#8fe6af'
  inverse-primary: '#82d8a3'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#762a2f'
  on-tertiary: '#ffffff'
  tertiary-container: '#944145'
  on-tertiary-container: '#ffc6c6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9ef5be'
  primary-fixed-dim: '#82d8a3'
  on-primary-fixed: '#002110'
  on-primary-fixed-variant: '#00522f'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#ffdad9'
  tertiary-fixed-dim: '#ffb3b3'
  on-tertiary-fixed: '#3f020a'
  on-tertiary-fixed-variant: '#7a2d32'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  cat-academic: '#00693E'
  cat-social: '#7C3AED'
  cat-food: '#EA6C00'
  cat-sports: '#D91B5C'
  cat-arts: '#00B4D8'
  glass-bg-light: rgba(255, 255, 255, 0.65)
  glass-bg-dark: rgba(30, 30, 30, 0.7)
  glass-border: rgba(255, 255, 255, 0.2)
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1'
  display-lg-mobile:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-mobile: 20px
  gutter-mobile: 12px
  radius-glass: 24px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  stack-xl: 40px
---

## Brand & Style

This design system captures the intersection of prestigious academic tradition and the vibrant energy of modern campus life. It is built for the "scholarly socialite"—students who balance rigorous academics with a deep desire for community connection.

The aesthetic follows a **Sophisticated Glassmorphism** direction. It utilizes translucent layers, high-quality typography, and subtle atmospheric blurs to create a sense of depth and lightness. The interface should feel like a pane of smart glass hovering over a dynamic campus environment, emphasizing clarity, fluidity, and premium execution. Motion should be elastic and "physics-based," mimicking the tactile feel of physical glass sliding over surfaces.

## Colors

The palette is anchored by Dartmouth Green, providing a sense of institutional gravity, while being offset by vibrant, category-specific accent colors that inject energy into the "young campus" feel.

The system is designed for high-transparency contexts. Backgrounds should use soft, multi-colored gradients derived from the primary and secondary colors, providing a colorful canvas for the glass overlays. 
- **Light Mode:** Use white-tinted glass (`#FFFFFF` at 65% opacity) with a subtle white inner glow.
- **Dark Mode:** Use rich charcoal-tinted glass (`#1E1E1E` at 70% opacity) with a 1.5px border to maintain definition against dark backgrounds.
- **Functional States:** Success, Error, and Warning states should use high-saturation variants of Green, Red, and Amber to ensure legibility through translucent layers.

## Typography

The typographic hierarchy utilizes **Sora** for display and headlines to provide a modern, geometric, and welcoming feel. Its slightly wider character set feels tech-forward and friendly. **Inter** is used for body text and labels for its exceptional legibility at small sizes and high-density information environments.

Large display type should utilize tighter letter-spacing to appear more "designed" and editorial. Labels and overlines should use uppercase with slight tracking (letter-spacing) to differentiate them from body content. For accessibility, never use a font weight lower than 400 for body text against blurred backgrounds.

## Layout & Spacing

The layout is optimized for mobile-first interaction (iOS/Android). It follows a flexible 4-column grid on mobile with 20px side margins to create "breathing room" for the glass containers.

Spacing follows an 8pt rhythm, emphasizing vertical stacks to allow users to scroll through event feeds comfortably. Content blocks should be grouped within "Glass Cards" that utilize the `stack-md` internal padding. When stacking elements like "Date" and "Event Title," use `stack-xs` (4px) to create a tight visual relationship. 

Navigation elements, like the Bottom Tab Bar, should be fully floating with a backdrop blur and a high `radius-glass` (24px) to separate them from the content beneath.

## Elevation & Depth

Depth is achieved through **Backdrop Filtering** and **Tonal Layering** rather than traditional drop shadows.

1.  **Level 0 (Base):** The dynamic gradient background (non-interactive).
2.  **Level 1 (Surface):** Standard cards and feed items. 14px Backdrop Blur, 1px white border at 20% opacity.
3.  **Level 2 (Float):** Buttons and active chips. Increased opacity and a subtle 0.5px inner glow to make them "pop" toward the user.
4.  **Level 3 (Overlay):** Modals, bottom sheets, and navigation bars. These receive the strongest blur (20px+) and a slightly darker tint in dark mode to signify a shift in the app's state.

Use 1.5px stroke icons (outlines) to maintain a clean, architectural look that doesn't compete with the transparency effects.

## Shapes

The shape language is "Rounded" to maintain a friendly, approachable campus vibe. 
- **Cards & Modals:** Use `rounded-xl` (1.5rem / 24px) to create a soft, high-end feel.
- **Buttons & Input Fields:** Use `rounded-lg` (1rem / 16px) for a distinct, pill-adjacent look that feels comfortable for thumb interactions.
- **Chips/Tags:** Use full pill shapes (50% of height) to clearly distinguish category labels from other interactive elements.
- **Glass Borders:** All glass containers must have a 1px to 1.5px border to ensure the edges don't disappear into the blurred background.

## Components

### Glass Buttons
Primary buttons use a semi-solid fill of Dartmouth Green with a subtle glass sheen. Secondary buttons are fully glass-based with a 1.5px white or primary-colored border. On press, the button should "sink" (scale 0.98) and the blur intensity should increase.

### Category Chips
Chips utilize the category-specific accent colors. In an inactive state, they are transparent with a colored border; when active, they take on a 20% opacity fill of that specific color to highlight the category without losing the glass effect.

### Event Cards
The primary vehicle for the app. Features a large image header with a blurred "glass cap" at the bottom where the title and time are housed. The entire card uses a 14px backdrop blur and 24px corner radius.

### Input Fields
Inputs are minimal: a 1px bottom border or a subtle glass well. Focus states are indicated by the border transitioning to Dartmouth Green and a subtle increase in the backdrop blur behind the field.

### Bottom Sheet (iOS Style)
Used for event details. It should handle a "grabber" handle at the top and utilize a heavy 25px blur to completely obscure the feed below it, focusing the student's attention on the specific event details.