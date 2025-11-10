# Usage Guide - New Features

## 🚀 Quick Start

### **Creating a Document:**

1. **From Dashboard:**
   ```
   Click "Create New Document with AI" button
   ↓
   Opens full-page generation experience at /generate
   ```

2. **Generation Page:**
   - **Close Button** (top-right): Returns to dashboard
   - **Question Mode Toggle**: Enable for guided questions
   - **Document Type**: Select AI Editor, Developer, Client, or General
   - **Thinking Effort**: Choose speed (Minimal/Low/Medium/High)
   - **Content Detail**: Choose length (Concise/Balanced/Detailed)
   - **Prompt**: Describe your document
   - **Quick Suggestions**: Click any chip to use template

3. **Generate:**
   - **Standard Mode**: Click "Generate Document" → See streaming → Auto-redirect to editor
   - **Question Mode**: Click "Start with Questions" → Answer questions → Generate → Streaming → Editor

---

## 🎯 **Features**

### **1. Full-Page Generation Experience**
```
┌─────────────────────────────────────────┐
│  [X]                                    │
│                                         │
│        Create Your Document             │
│    Powered by GPT-5 with real-time     │
│                                         │
│  ╔═══════════════════════════════════╗ │
│  ║  Question Mode: [Toggle]          ║ │
│  ║                                   ║ │
│  ║  Document Type: [4 options]      ║ │
│  ║  Thinking Effort: [4 levels]     ║ │
│  ║  Content Detail: [3 levels]      ║ │
│  ║                                   ║ │
│  ║  [Large Prompt Input]            ║ │
│  ║                                   ║ │
│  ║  [Generate Document Button]      ║ │
│  ║                                   ║ │
│  ║  ──── Quick Suggestions ────     ║ │
│  ║  [Chip] [Chip] [Chip] [Chip]    ║ │
│  ╚═══════════════════════════════════╝ │
└─────────────────────────────────────────┘
```

### **2. Real-Time Streaming**
```
During generation:
┌─────────────────────────────────────┐
│                                     │
│         [Spinning Sparkles]         │
│                                     │
│    Generating Your Document...      │
│     1,234 characters generated      │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  [Live Content Preview]      │  │
│  │  Shows text as it generates  │  │
│  │  Scrollable if long          │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘

When complete:
┌─────────────────────────────────────┐
│                                     │
│         [Checkmark Icon]            │
│                                     │
│      Document Generated!            │
│       Opening editor...             │
│                                     │
│     Auto-redirects in 1.5s          │
└─────────────────────────────────────┘
```

### **3. Question Mode Flow**
```
1. Enable Question Mode
   ↓
2. Enter initial prompt
   ↓
3. Click "Start with Questions"
   ↓
4. Question Modal appears:
   ┌──────────────────────────────┐
   │ Question 1 of 5              │
   │ [■■■□□□□□] Progress         │
   │                              │
   │ What is the main purpose?    │
   │                              │
   │ [Answer Input]               │
   │                              │
   │ [Previous] [Next Question]   │
   └──────────────────────────────┘
   ↓
5. Answer all questions
   ↓
6. Last question → "Generate Document"
   ↓
7. Modal closes
   ↓
8. Streaming view (same as standard)
   ↓
9. Auto-redirect to editor
```

### **4. Fixed Download Dropdown**
```
In Editor Toolbar:

Hover or Click "Download"
   ↓
┌──────────────────────┐
│ Download as PDF      │
│ Download as Image    │
└──────────────────────┘
   ↑
   Stays open while hovering!
   Click option to download
   Closes when clicking outside
```

---

## ⚙️ **Configuration Options**

### **Document Types:**
- **AI Editor**: For Cursor, Windsurf, etc.
- **Developer**: Technical documentation
- **Client**: Proposals, presentations
- **General**: Standard documents

### **Thinking Effort (Speed vs Quality):**
- **Minimal**: ⚡ 3-5 seconds (quick drafts)
- **Low**: 🚀 5-10 seconds (standard)
- **Medium**: ⚖️ 10-20 seconds (balanced) *Default*
- **High**: 🧠 20-40 seconds (deep analysis)

### **Content Detail (Length):**
- **Concise**: 📝 Brief, to the point
- **Balanced**: 📄 Standard length *Default*
- **Detailed**: 📚 Comprehensive, thorough

---

## 💡 **Tips**

### **For Best Results:**
1. **Use Question Mode** for complex documents
2. **Select Higher Effort** for important docs
3. **Choose Detailed Verbosity** for comprehensive coverage
4. **Use Quick Suggestions** for inspiration
5. **Watch the streaming** to see progress in real-time

### **Keyboard Shortcuts:**
- **Esc**: Close generation page (returns to dashboard)
- **Enter**: Submit prompt (when focused on textarea)

### **Voice Input:**
- Click microphone icon next to prompt
- Speak your document description
- Text will be added to prompt automatically

---

## 🎨 **Visual States**

### **Button States:**
```
Default:     [Button]
Hover:       [Button] ← Slight lift, shadow increase
Selected:    [Button] ← Colored border, filled background
Disabled:    [Button] ← Grayed out, no interaction
```

### **Progress Indicators:**
```
Generating:   [Spinning Icon] + Character count
Complete:     [Checkmark] + Success message
Error:        [X] + Error message (red)
```

### **Question Progress:**
```
[■■■■□□□□] Question 4 of 8
  ↑
  Filled bars show completed questions
```

---

## 📱 **Mobile Experience**

### **Layout Adjustments:**
- **Document Types**: 2x2 grid (instead of 1x4)
- **Thinking Effort**: 2x2 grid (instead of 1x4)
- **Content Detail**: 3x1 grid (same as desktop)
- **Buttons**: Full width, larger tap targets
- **Text**: Slightly smaller but still readable
- **Spacing**: Reduced but comfortable

### **Touch Gestures:**
- **Tap**: Select options, toggle switches
- **Swipe**: Scroll content
- **Pinch**: Zoom (if needed)

---

## 🔄 **Navigation Flow**

```
Dashboard
    ↓ Click "Create New Document"
Generate Page (/generate)
    ↓ Fill form
    ↓ Click "Generate"
Streaming View
    ↓ Auto-redirect (1.5s after complete)
Editor (/editor/[id])
    ↓ Edit document
    ↓ Download, Share, etc.
Dashboard
    (via navbar or close buttons)
```

---

## ⚡ **Performance**

### **Expected Times:**

| Configuration | Time | Use Case |
|--------------|------|----------|
| Minimal + Low | 3-5s | Quick notes |
| Low + Medium | 5-10s | Standard docs |
| Medium + Medium | 10-20s | Balanced *Default* |
| High + High | 20-40s | Important docs |

### **Streaming Benefits:**
- See progress immediately
- Know it's working
- Cancel if needed (close window)
- Preview content before completion

---

## 🎉 **Summary**

**New Experience:**
1. ✅ Full-page generation (no cramped modal)
2. ✅ Real-time streaming (see progress)
3. ✅ Question mode (guided generation)
4. ✅ Fixed download (works perfectly)
5. ✅ Smooth animations (professional feel)
6. ✅ Auto-redirect (seamless flow)

**Navigation:**
- Dashboard → Generate Page → Streaming → Editor
- Close button returns to dashboard anytime
- All flows are smooth and intuitive

**Ready to use!** 🚀✨
