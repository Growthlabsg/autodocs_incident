# 🍎 Apple UI Migration Guide

## Quick Start

### 1. Replace Tailwind Config
```bash
# Backup old config
mv tailwind.config.js tailwind.config.old.js

# Use new Apple config
mv tailwind.config.apple.js tailwind.config.js
```

### 2. Update Global Styles
```bash
# In app/globals.css or styles/globals.css
# Replace current content with apple-globals.css
```

### 3. Restart Dev Server
```bash
npm run dev
```

---

## Component Migration

### Before (Old Theme)
```jsx
<button className="bg-teal-600 text-white px-4 py-2 rounded">
  Click Me
</button>
```

### After (Apple Theme)
```jsx
<button className="btn-primary">
  Click Me
</button>
```

---

## Color Mapping

### Old → New
- `bg-teal-600` → `bg-apple-blue`
- `text-teal-600` → `text-apple-blue`
- `bg-slate-900` → `bg-apple-bg-primary`
- `text-slate-100` → `text-apple-text-primary`
- `bg-slate-800` → `bg-apple-bg-secondary`

---

## Component Examples

### Button
```jsx
// Primary
<button className="btn-primary">Save</button>

// Secondary
<button className="btn-secondary">Cancel</button>

// Danger
<button className="btn-danger">Delete</button>
```

### Card
```jsx
<div className="card">
  <h3 className="text-h3 mb-2">Card Title</h3>
  <p className="text-body text-apple-text-secondary">
    Card content goes here
  </p>
</div>
```

### Input
```jsx
<input
  type="text"
  className="input"
  placeholder="Enter text..."
/>
```

### Badge
```jsx
<span className="badge-sev1">SEV1</span>
<span className="badge-success">Active</span>
```

---

## Full Page Example

```jsx
export default function DashboardPage() {
  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Welcome back! Here's what's happening.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid-metrics mb-8">
        <div className="metric-card">
          <div className="metric-value">45</div>
          <div className="metric-label">Total Incidents</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">12</div>
          <div className="metric-label">Active</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">3</div>
          <div className="metric-label">SEV1</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">98.5%</div>
          <div className="metric-label">SLA</div>
        </div>
      </div>

      {/* Content */}
      <div className="grid-cards">
        <div className="card-hover">
          <h3 className="text-h3 mb-2">Card Title</h3>
          <p className="text-body text-apple-text-secondary">
            Card content
          </p>
        </div>
      </div>
    </div>
  )
}
```

---

## Next Steps

1. Update each page component to use new classes
2. Test on all pages
3. Adjust as needed
4. Remove old theme files once migrated

**The new design is cleaner, more professional, and follows Apple's design language!** 🍎
