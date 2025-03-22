# Design System Guide

## Table of Contents
1. [Architecture](#architecture)
2. [File Structure](#file-structure)
3. [Using the Design System](#using-the-design-system)
4. [Best Practices](#best-practices)
5. [For New Team Members](#for-new-team-members)

## Architecture

```
┌───────────────────────────┐
│      _variables.scss      │
│                           │
│      Design Tokens:       │
│      - Colors             │
│      - Typography         │
│      - Spacing            │
│      - Breakpoints        │
└──────────────┬────────────┘
               │
               │ Imports
               ▼
┌──────────────────────────┐          ┌─────────────────────────┐
│       main.scss          │          │    StyleguideView.vue   │
│                          │   Uses   │                         │
│  Imports all files       ├──────────►    Visual display of    │
│  Base styling            │          │    design system        │
└─────────┬────────────────┘          └─────────────────────────┘
          │
          │ Imports
          ▼
┌────────────────────────────────────────────────────────────────┐
│                      Core Styling Files                        │
│                                                                │
│  ┌─────────────┐    ┌─────────────┐   ┌─────────────────┐     │
│  │_typography.scss  │_layout.scss │   │  utilities.scss │     │
│  │             │    │             │   │                 │     │
│  │ Typography  │    │ Grid system │   │ Helper classes  │     │
│  │ classes     │    │ & containers│   │                 │     │
│  └─────────────┘    └─────────────┘   └─────────────────┘     │
│                                                                │
│  ┌─────────────┐                                               │
│  │ _icons.scss │                                               │
│  │             │                                               │
│  │ Icon system │                                               │
│  │ & variables │                                               │
│  └─────────────┘                                               │
└────────────────────────────────────────────────────────────────┘
```

## File Structure

### _variables.scss
Defines all design tokens (colors, sizes, spacing, etc.).

```scss
// Color variables
$primary-500: #508675;
$secondary-400: #78B1D0;
$neutral-900: #000000;

// Spacing variables
$spacing-small: 0.5rem;  // 8px
$spacing-medium: 1rem;   // 16px
```

### _typography.scss
Contains typography classes for headings and text.

```scss
.heading-1 {
  font-size: $h1-font-size;      // 3.75rem = 60px
  line-height: $h1-line-height;  // 4.5rem = 72px
  font-weight: $h1-font-weight;  // 700
}

.body-3-regular {
  font-size: $body-3-font-size;  // 0.875rem = 14px
  line-height: $body-3-line-height; // 1.25rem = 20px
  font-weight: $body-3-font-weight; // 400
}
```

### utilities.scss
Minimalist helper classes for layout and spacing.

```scss
// Margin
.mb-small { margin-bottom: $spacing-small; }

// Layout
.d-flex { display: flex; }
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### _layout.scss
Grid system and containers for layout.

```scss
.grid-container {
  &.computer {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 32px;
  }
  
  &.responsive {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
  }
}
```

### _icons.scss
System for icons with sizes and states.

```scss
.icon {
  &.medium {
    width: 56px;
    height: 56px;
    border-radius: 6px;
  }
  
  &.filled {
    background-color: $secondary-300;
    color: white;
  }
}
```

### main.scss
Imports all other SCSS files and defines base styling.

```scss
@use 'variables' as *;
@use 'utilities';
@use 'layout';
@use 'icons';
@use 'typography';

// Reset & base styles
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

## Using the Design System

### Variables
Always use variables instead of hardcoded values:

```scss
// CORRECT
.element {
  color: $primary-500;
  margin: $spacing-medium;
}

// INCORRECT
.element {
  color: #508675;
  margin: 16px;
}
```

### Typography
Use the pre-defined typography classes:

```html
<h1 class="heading-1">Heading</h1>
<p class="body-2-regular">Body text</p>
```

### Layout
Use grid and container classes for layout:

```html
<!-- 12-column grid for desktop -->
<div class="grid-container computer">
  <!-- Content -->
</div>
```

### Icons
Use icon classes for consistent styling:

```html
<span class="icon medium">
  <IconComponent />
</span>
```

### Utility Classes
Use utility classes for quick styling:

```html
<div class="d-flex mb-medium">
  <!-- Content with flex layout and bottom margin -->
</div>
```

## Best Practices

1. **Use variables**: Never use hardcoded values - use variables from _variables.scss
2. **Prefer existing classes**: Check if a class already exists for your needs
3. **Consistency in spacing**: Use $spacing-small, $spacing-medium, etc.
4. **Minimal CSS**: Avoid writing new CSS if utility classes can solve the problem
5. **Check the styleguide**: Use StyleguideView.vue as a reference
