# Next-Themes Setup Documentation

## Overview
This project uses `next-themes` for seamless light/dark mode switching with dark mode as the default theme.

## Configuration

### ThemeProvider Component
Located at `components/providers/ThemeProvider.tsx`

The ThemeProvider is configured with:
- **attribute**: `"class"` - Uses the `dark` class on the HTML element
- **defaultTheme**: `"dark"` - Dark mode is the default theme
- **enableSystem**: `false` - System preference is not used; user preference takes priority
- **storageKey**: `"theme"` - User's theme preference is stored in localStorage under the key "theme"

### Layout Integration
The root layout (`app/layout.tsx`) includes:
- `suppressHydrationWarning` on the `<html>` element to prevent hydration mismatches
- ThemeProvider wrapper around all children components

## Usage

### Using the Theme Hook
Import and use the `useThemedHook` from `lib/hooks.ts`:

```typescript
import { useThemedHook } from '@/lib/hooks';

export function MyComponent() {
  const { theme, setTheme, themes, mounted } = useThemedHook();
  
  if (!mounted) return null;
  
  return (
    <div>
      Current theme: {theme}
      <button onClick={() => setTheme('light')}>Light Mode</button>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
    </div>
  );
}
```

### Using the Theme Toggle Component
Import the `ThemeToggle` component:

```typescript
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeToggle />
    </header>
  );
}
```

## Styling

The project uses Tailwind CSS with a custom `dark` variant defined in `app/globals.css`:

```css
@custom-variant dark (&:is(.dark *));
```

This allows you to style dark mode elements using the `dark:` prefix:

```tsx
<div className="bg-white dark:bg-black text-black dark:text-white">
  Content
</div>
```

## CSS Variables

Both light and dark modes use CSS variables for theming. Check `app/globals.css` for the complete list of theme variables including:
- Colors: background, foreground, card, primary, secondary, etc.
- Border radius values
- Sidebar styling
- Chart colors

## Features

✅ Dark mode enabled by default
✅ Persistent theme preference (stored in localStorage)
✅ No flash of unstyled content (FOUC)
✅ Hydration-safe implementation
✅ Easy theme switching with provided utilities
✅ Fully typed with TypeScript