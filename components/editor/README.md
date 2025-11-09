# Editor Components

This directory contains modular, reusable components for the document editor feature.

## Component Structure

### `editor-sidebar.tsx`
**Purpose:** Left sidebar navigation with document info and actions
- Displays logo, document title, and status
- Navigation to dashboard
- Save, Download PDF, Download PNG actions
- User profile display
- Expandable/collapsible on desktop
- Hamburger menu on mobile

**Props:**
- `sidebarOpen`, `sidebarExpanded` - State management
- `document`, `session` - Data
- `isSaving` - Loading state
- Callbacks for actions

---

### `editor-toolbar.tsx`
**Purpose:** Top fixed toolbar with document title and primary actions
- Document title editing
- Save button with loading state
- Share toggle button
- Hamburger menu for mobile

**Props:**
- `title`, `isSaving` - Document state
- Callbacks for title change, save, share, menu

---

### `formatting-toolbar.tsx`
**Purpose:** Formatting controls for text styling
- Edit/Preview mode toggle
- Font size and family selection
- Text and background color pickers
- Text alignment buttons (only in edit mode)

**Props:**
- `viewMode` - Current mode (edit/preview)
- Font and color settings
- `selectedText` - For alignment
- Callbacks for all changes

---

### `markdown-renderer.tsx`
**Purpose:** Beautiful markdown preview with styled tables
- GitHub Flavored Markdown support
- Custom-styled tables with gradients
- Styled headings, lists, code blocks
- Blockquotes, links, horizontal rules
- HTML rendering support via rehype-raw

**Props:**
- `content` - Markdown content to render
- `fontSize`, `fontFamily`, `textColor` - Styling

---

### `ai-rewrite-panel.tsx`
**Purpose:** AI content rewriting interface
- Text input for instructions
- Shows selected text preview
- Rewrite button with loading state
- Manages its own prompt state

**Props:**
- `selectedText` - Currently selected text
- `isRewriting` - Loading state
- `onRewrite` - Callback with instruction

---

### `share-panel.tsx`
**Purpose:** Document sharing controls
- Public/Private status display
- Shareable link with copy button
- Optional password protection
- Make public action

**Props:**
- `isPublic`, `shareableLink` - Document state
- `onMakePublic` - Callback with optional password

---

## Benefits of This Structure

### Maintainability
- Each component has a single responsibility
- Easy to locate and update specific features
- Clear separation of concerns

### Reusability
- Components can be reused in different contexts
- Consistent UI patterns across the app
- Easier to create variants

### Testing
- Components can be tested in isolation
- Smaller, focused test suites
- Easier to mock dependencies

### Performance
- Can implement code-splitting per component
- Easier to optimize individual components
- Reduced re-renders with proper prop management

### Developer Experience
- Easier to onboard new developers
- Clear component hierarchy
- Self-documenting through file structure

---

## File Size Comparison

**Before:** Single page.tsx file = ~800 lines
**After:** 
- Main page.tsx = ~370 lines
- 6 component files = ~100-200 lines each
- Total: More organized, easier to navigate

---

## Usage Example

```tsx
import {
  EditorSidebar,
  EditorToolbar,
  FormattingToolbar,
  MarkdownRenderer,
  AIRewritePanel,
  SharePanel,
} from "@/components/editor";

// Use in your page
<EditorSidebar {...props} />
<EditorToolbar {...props} />
// etc.
```

---

## Future Improvements

1. **Add TypeScript interfaces file** - Centralize all prop types
2. **Add Storybook** - Visual component documentation
3. **Add unit tests** - Test each component independently
4. **Add accessibility features** - ARIA labels, keyboard navigation
5. **Add component variants** - Different sizes, themes
