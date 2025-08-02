# GAMEDAY+ FanHub - Official Gradient Styles

## Primary Brand Gradient

**ALWAYS use these exact gradient specifications for ALL components:**

### CSS Classes

```css
.gradient-bg {
  background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
}

.gradient-text {
  background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.icon-gradient {
  background: linear-gradient(135deg, #cc001c, #a10014, #73000d, #a10014, #cc001c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Tailwind Utilities

For background gradients:
```css
bg-gradient-to-r from-[#cc001c] via-[#a10014] to-[#73000d]
```

### Color Codes

- Primary Red: `#cc001c`
- Dark Red: `#a10014`
- Deep Red: `#73000d`

### Usage Guidelines

1. **Text Elements**: Use `gradient-text` class for headings, titles, and important text
2. **Icons**: Use `icon-gradient` class for FontAwesome icons
3. **Backgrounds**: Use `gradient-bg` class for button backgrounds and accent areas
4. **Active States**: Use the full gradient for active tabs, selected items, etc.

### DO NOT USE

- `red-600`, `red-700`, `red-800` or any other generic red colors
- Random red gradients not matching the brand
- Solid red colors instead of the gradient

### Consistency

Every new component MUST use these exact gradient specifications to maintain brand consistency across the entire application.
