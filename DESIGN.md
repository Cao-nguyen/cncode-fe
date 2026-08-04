# CNcode Design System

## Color Palette

### Primary Colors

| Color Name | Hex Value | Usage |
|------------|-----------|-------|
| Primary | `#3BA4E8` | Primary buttons, active states, accents |
| Primary Hover | `#2F8FD6` | Hover states for primary elements |
| Primary Light | `#E6F4FB` | Secondary elements, backgrounds |

### Text Colors

| Color Name | Hex Value | Usage |
|------------|-----------|-------|
| Text Main | `#1E293B` | Primary text content |
| Text Sub | `#64748B` | Secondary text, descriptions |
| Text Muted | `#94A3B8` | Disabled text, placeholders |
| Text White | `#FFFFFF` | Text on dark backgrounds |

### Background Colors

| Color Name | Hex Value | Usage |
|------------|-----------|-------|
| Background Main | `#F8FAFC` | Main page background |
| Background Card | `#FFFFFF` | Card backgrounds |
| Background Section | `#F1F5F9` | Section backgrounds |

### Border & UI Colors

| Color Name | Hex Value | Usage |
|------------|-----------|-------|
| Border | `#E2E8F0` | Borders, dividers |
| Hover | `#F1F5F9` | Hover backgrounds |
| Hover Blue | `#E6F4FB` | Blue hover states |
| Hover Strong | `#DBEAFE` | Strong hover states |

### Button Colors

| Color Name | Hex Value | Usage |
|------------|-----------|-------|
| Button Primary | `#3BA4E8` | Primary buttons |
| Button Primary Hover | `#2F8FD6` | Primary button hover |
| Button Disabled | `#BFDBFE` | Disabled button state |

### Status Colors

| Color Name | Hex Value | Usage |
|------------|-----------|-------|
| Success | `#22C55E` | Success states, positive feedback |
| Warning | `#F59E0B` | Warning states, alerts |
| Error | `#EF4444` | Error states, destructive actions |
| Info | `#3BA4E8` | Informational states |

### Shadow Scale

| Shadow Name | Value | Usage |
|-------------|-------|-------|
| Shadow SM | `0 1px 2px rgba(0, 0, 0, 0.05)` | Small shadows |
| Shadow MD | `0 4px 8px rgba(0, 0, 0, 0.08)` | Medium shadows |
| Shadow LG | `0 10px 20px rgba(0, 0, 0, 0.1)` | Large shadows |

### Border Radius

| Size | Value | Usage |
|------|-------|-------|
| SM | `8px` | Small elements, badges |
| MD | `12px` | Medium elements, inputs |
| LG | `16px` | Large elements, cards |

## CSS Variables

Colors are configured in `app/globals.css`:

```css
:root {
  /* Primary */
  --cn-primary: #3BA4E8;
  --cn-primary-hover: #2F8FD6;
  --cn-primary-light: #E6F4FB;

  /* Text */
  --cn-text-main: #1E293B;
  --cn-text-sub: #64748B;
  --cn-text-muted: #94A3B8;
  --cn-text-white: #FFFFFF;

  /* Background */
  --cn-bg-main: #F8FAFC;
  --cn-bg-card: #FFFFFF;
  --cn-bg-section: #F1F5F9;

  /* Border */
  --cn-border: #E2E8F0;

  /* Hover */
  --cn-hover: #F1F5F9;
  --cn-hover-blue: #E6F4FB;
  --cn-hover-strong: #DBEAFE;

  /* Button */
  --cn-btn-primary: #3BA4E8;
  --cn-btn-primary-hover: #2F8FD6;
  --cn-btn-disabled: #BFDBFE;

  /* Status */
  --cn-success: #22C55E;
  --cn-warning: #F59E0B;
  --cn-error: #EF4444;
  --cn-info: #3BA4E8;

  /* Shadow */
  --cn-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --cn-shadow-md: 0 4px 8px rgba(0, 0, 0, 0.08);
  --cn-shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.1);

  /* Radius */
  --cn-radius-sm: 8px;
  --cn-radius-md: 12px;
  --cn-radius-lg: 16px;
}
```

## Usage Examples

### Primary Button
```tsx
<button className="bg-[#3BA4E8] hover:bg-[#2F8FD6] text-white rounded-[12px]">
  Primary Button
</button>
```

### Card
```tsx
<div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-md">
  Card Content
</div>
```

### Status Badge
```tsx
<span className="bg-[#22C55E] text-white rounded-[8px]">Success</span>
<span className="bg-[#F59E0B] text-white rounded-[8px]">Warning</span>
<span className="bg-[#EF4444] text-white rounded-[8px]">Error</span>
```

### Text Styling
```tsx
<p className="text-[#1E293B]">Main text</p>
<p className="text-[#64748B]">Secondary text</p>
<p className="text-[#94A3B8]">Muted text</p>
```

## Dark Mode Support

The design system includes dark mode support with automatic color inversion. Dark mode is activated via the `.dark` class on the body element.
