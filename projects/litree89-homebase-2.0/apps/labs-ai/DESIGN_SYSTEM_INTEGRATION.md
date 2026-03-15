# Premium Design System Integration Guide

## Quick Start

### Step 1: Update app/layout.tsx

Replace your root layout with the ThemeProvider wrapper:

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import { RootLayoutClient } from "@/components/RootLayoutClient";
import "./globals.premium.css";

export const metadata: Metadata = {
  title: "LitLabs AI - Premium Content Creation",
  description: "Create amazing content with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
```

### Step 2: Update Header with Theme Switcher

```typescript
// Add to your header component
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { ThemeCustomizationPanel } from "@/components/ThemeCustomizationPanel";

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1>LitLabs AI</h1>
        <div className="flex items-center gap-4">
          <ThemeSwitcher minimal={true} />
          <ThemeCustomizationPanel />
        </div>
      </div>
    </header>
  );
}
```

### Step 3: Use Premium Components

```typescript
// Example: Using premium components
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export function ExamplePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-6xl font-serif font-bold mb-4">
          Welcome to LitLabs
        </h1>
        <p className="text-xl text-text-secondary mb-8">
          Create amazing content with AI
        </p>
        <Button variant="primary" size="lg">
          Get Started
        </Button>
      </section>

      {/* Cards with content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <Card key={item} variant="elevated" hoverable>
            <h3 className="text-xl font-semibold mb-2">Feature {item}</h3>
            <p className="text-text-secondary mb-4">
              Description of feature {item}
            </p>
            <Badge variant="primary">Coming Soon</Badge>
          </Card>
        ))}
      </div>

      {/* Form example */}
      <Card variant="bordered" padding="lg">
        <h2 className="text-2xl font-serif font-bold mb-6">Sign Up</h2>
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
          />
          <Button fullWidth variant="primary">
            Create Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
```

## Component Quick Reference

### Button Variants

```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Delete</Button>
```

### Button Sizes

```tsx
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

### Card Variants

```tsx
<Card variant="elevated">Elevated</Card>
<Card variant="bordered">Bordered</Card>
<Card variant="flat">Flat</Card>
<Card variant="glass">Glass Effect</Card>
```

### Badges

```tsx
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>
```

### Input States

```tsx
<Input label="Normal" />
<Input label="With Error" error="Email is required" />
<Input label="With Hint" hint="We'll never share your email" />
<Input label="With Icon" icon={<MailIcon />} />
```

## Theming Examples

### Access Theme in Component

```typescript
'use client';

import { useTheme } from '@/context/ThemeContext';

export function MyComponent() {
  const { currentTheme, setTheme } = useTheme();

  return (
    <div
      style={{
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.text,
      }}
    >
      <p>Current Theme: {currentTheme.name}</p>
      <button onClick={() => setTheme('darkLuxury')}>
        Switch to Dark Luxury
      </button>
    </div>
  );
}
```

### Using CSS Variables

```typescript
// In any component
<div
  className="p-6 rounded-lg border"
  style={{
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text)',
  }}
>
  Content
</div>
```

### In Tailwind Classes

```typescript
<div className="bg-surface border border-border text-text rounded-lg p-6">
  Content with theme colors
</div>
```

## Available Color CSS Variables

```css
/* Background & Surface */
--color-background
--color-surface
--color-surface-alt

/* Borders & Text */
--color-border
--color-text
--color-text-secondary
--color-text-tertiary

/* Brand Colors */
--color-primary
--color-primary-light
--color-primary-dark
--color-accent
--color-accent-light
--color-accent-dark

/* Semantic Colors */
--color-success
--color-warning
--color-error
--color-info
```

## Design Tokens

### Spacing Scale

0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20, 24
(Represents 0px, 4px, 8px, ... 96px)

### Font Sizes

xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px), 3xl (30px), 4xl (36px), 5xl (48px), 6xl (60px)

### Shadow Levels

xs, sm, md, lg, xl, 2xl, premium, premium-lg

### Border Radius

xs (4px), sm (6px), base (8px), md (12px), lg (16px), xl (20px), 2xl (24px), 3xl (32px), full (9999px)

## Animation Classes

```typescript
// Predefined animations
animate-fade-in      // Fade in animation
animate-slide-in     // Slide in from bottom
animate-scale-in     // Scale up animation
animate-pulse-soft   // Soft pulsing animation

// Transition utilities
transition-all       // All properties
transition-colors    // Color changes
transition-opacity   // Opacity changes
transition-transform // Transform changes
```

## Best Practices

### ✅ Do

- Use semantic color names (primary, accent, success)
- Import components from @/components/ui
- Use the useTheme hook for dynamic colors
- Apply design tokens consistently
- Test with all 6 theme packs
- Use CSS variables for colors
- Leverage component variants

### ❌ Don't

- Hardcode colors in components
- Use arbitrary color values
- Create component-specific color schemes
- Ignore theme context
- Forget to test dark mode
- Use old component libraries
- Break the spacing scale

## Migration from Old Components

### Before (Old)

```typescript
<div className="bg-blue-600 text-white p-4 rounded">
  Click me
</div>
```

### After (New)

```typescript
<Button variant="primary">
  Click me
</Button>
```

## Customization Examples

### Create a Custom Component

```typescript
'use client';

import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/Card';

export function CustomCard({ title, children }) {
  const { currentTheme } = useTheme();

  return (
    <Card variant="elevated" padding="lg">
      <h3
        className="text-xl font-serif font-bold mb-4"
        style={{ color: currentTheme.colors.primary }}
      >
        {title}
      </h3>
      {children}
    </Card>
  );
}
```

### Extend Button Component

```typescript
import { Button } from '@/components/ui/Button';

export function PrimaryButton(props) {
  return <Button {...props} variant="primary" size="lg" />;
}
```

## Troubleshooting

### Colors not applying?

- Make sure you wrapped your app with `RootLayoutClient`
- Check if `globals.premium.css` is imported in layout
- Verify ThemeProvider is loaded

### Hydration warnings?

- All theme-aware components use 'use client'
- mounted flag in ThemeContext prevents SSR issues
- Make sure layout is wrapped correctly

### Theme not persisting?

- Check browser localStorage is not disabled
- Verify localStorage keys: "litlabs-theme", "litlabs-custom-colors"
- Check browser dev tools > Application > Local Storage

### Tailwind colors not working?

- Make sure tailwind.config.premium.ts is being used
- Restart Next.js dev server after config changes
- Clear .next folder and rebuild

## Performance Tips

1. **Lazy load components**: Use dynamic imports for heavy components
2. **Optimize fonts**: Use `font-display: swap` for web fonts
3. **Cache themes**: localStorage automatically caches user theme
4. **Minimize CSS**: Remove unused design tokens
5. **Optimize images**: Use next/image for automatic optimization

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ❌ Not supported (CSS Variables required)

## Additional Resources

- Full documentation: [DESIGN_SYSTEM_GUIDE.md](./DESIGN_SYSTEM_GUIDE.md)
- Design tokens: [lib/design-system.ts](./lib/design-system.ts)
- Theme context: [context/ThemeContext.tsx](./context/ThemeContext.tsx)
- Example components: [components/ui/](./components/ui/)

## Support

For issues or questions:

1. Check the DESIGN_SYSTEM_GUIDE.md
2. Review component source code
3. Check for console errors
4. Verify integration steps are complete
5. Create an issue in the repository

---

**Next Steps:**

1. ✅ Integrate ThemeProvider into your app
2. ✅ Replace old components with new ones
3. ✅ Test with all 6 theme packs
4. ✅ Customize colors and styling as needed
5. ✅ Deploy to production

**Status:** Ready for production use! 🚀
