# 🔍 Streaming Debug Guide

## Overview

Comprehensive debug logging has been added to `/api/documents/generate/route.ts` to help diagnose streaming and reasoning issues with OpenAI's GPT-5 API.

---

## 🛠️ Debug Features Added

### 1. **Configuration Logging**
```
🚀 Starting document generation...
📝 Config: {
  model: "gpt-5",
  effort: "medium",
  verbosity: "medium",
  documentType: "general",
  promptLength: 150
}
```

**What it shows:**
- Confirms generation started
- Shows all configuration parameters
- Displays prompt length (not content for privacy)

### 2. **Stream Initialization Logging**
```
✅ Stream initialized successfully
```

**OR on error:**
```
❌ Failed to initialize stream: {
  message: "Internal server error",
  status: 500,
  code: "internal_error",
  type: "internal_error",
  error: { ... }
}
```

**What it shows:**
- Whether the OpenAI stream started successfully
- Detailed error info if initialization fails
- API error codes and types

### 3. **Event Processing Logging**
```
📡 Starting stream processing...
📨 Event #1: { type: "response.start", hasData: false }
📨 Event #2: { type: "response.reasoning_summary_text.delta", hasData: true }
📨 Event #3: { type: "response.output_text.delta", hasData: true }
...
```

**What it shows:**
- First 10 events received from OpenAI
- Event types and whether they contain data
- Helps identify missing or unexpected event types

### 4. **Reasoning Summary Logging**
```
🧠 Reasoning chunk #1: {
  length: 42,
  preview: "Let me analyze this request and plan..."
}
🧠 Reasoning chunk #2: {
  length: 58,
  preview: "Based on the requirements, I will structure..."
}
...
```

**What it shows:**
- First 5 reasoning chunks
- Length of each chunk
- Preview of reasoning text (first 50 chars)
- Confirms reasoning is being received

### 5. **Content Streaming Logging**
```
✍️ Content chunk #1: {
  length: 150,
  totalLength: 150,
  preview: "<h1>Document Title</h1><p>Introduction..."
}
✍️ Content chunk #2: {
  length: 200,
  totalLength: 350,
  preview: "This section covers the main points..."
}
...
```

**What it shows:**
- First 5 content chunks
- Length of each chunk
- Running total of content length
- Preview of content (first 50 chars)

### 6. **Stream Completion Logging**
```
✅ Stream completed: {
  totalEvents: 157,
  reasoningChunks: 8,
  contentChunks: 145,
  finalContentLength: 5432
}
```

**What it shows:**
- Total number of events processed
- How many were reasoning chunks
- How many were content chunks
- Final document length

### 7. **Document Save Logging**
```
💾 Saving document to database...
✅ Document saved: {
  id: "673282a1f8e4c5b3d9e7f2a1",
  title: "Technical specification for a mobile app",
  contentLength: 5432
}
✅ User document count updated: 6
```

**What it shows:**
- Document save started
- Document ID and title
- Final content length
- Updated user document count

### 8. **Completion Logging**
```
🎉 Generation complete! Document ID: 673282a1f8e4c5b3d9e7f2a1
```

**What it shows:**
- Successful completion
- Final document ID for verification

### 9. **Error Logging (Detailed)**

**Stream-level errors:**
```
❌ Streaming error details: {
  message: "Internal server error",
  status: 500,
  code: "internal_error",
  type: "internal_error",
  headers: { ... },
  requestID: "req_e0243226de114c998b60022b5805d914",
  error: { ... },
  stack: "Error: Internal server error\n    at ..."
}
```

**Top-level errors:**
```
❌ Document generation error (top level): {
  message: "Failed to initialize stream",
  status: 500,
  code: "internal_error",
  type: "internal_error",
  headers: { ... },
  requestID: "req_...",
  error: { ... },
  stack: "..."
}
```

**What it shows:**
- Complete error object
- HTTP status codes
- OpenAI error codes and types
- Request IDs for support tickets
- Full stack traces
- Response headers

---

## 🔄 Debug Flow

### Successful Generation Flow:
```
1. 🚀 Starting document generation...
2. 📝 Config: {...}
3. ✅ Stream initialized successfully
4. 📡 Starting stream processing...
5. 📨 Event #1-10: {...}
6. 🧠 Reasoning chunk #1-5: {...}
7. ✍️ Content chunk #1-5: {...}
8. ✅ Stream completed: {...}
9. 💾 Saving document to database...
10. ✅ Document saved: {...}
11. ✅ User document count updated: X
12. 🎉 Generation complete! Document ID: ...
```

### Error Flow (Stream Init):
```
1. 🚀 Starting document generation...
2. 📝 Config: {...}
3. ❌ Failed to initialize stream: {...}
4. ❌ Document generation error (top level): {...}
```

### Error Flow (During Stream):
```
1. 🚀 Starting document generation...
2. 📝 Config: {...}
3. ✅ Stream initialized successfully
4. 📡 Starting stream processing...
5. 📨 Event #1-3: {...}
6. ❌ Streaming error details: {...}
```

---

## 🐛 Common Issues & Debug Output

### Issue 1: "Internal server error"

**Debug Output to Look For:**
```
❌ Failed to initialize stream: {
  message: "Internal server error",
  status: 500,
  code: "internal_error",
  type: "internal_error"
}
```

**Possible Causes:**
1. **Invalid model name** - `gpt-5` might not be available
2. **API quota exceeded** - Check OpenAI billing
3. **Invalid API key** - Verify `OPENAI_API_KEY`
4. **API feature not enabled** - Reasoning might not be available

**How to Fix:**
- Try changing model from `gpt-5` to `gpt-4o`
- Check OpenAI dashboard for quota/limits
- Verify API key is valid
- Remove `reasoning` parameter to test

### Issue 2: No Reasoning Chunks

**Debug Output:**
```
✅ Stream completed: {
  totalEvents: 145,
  reasoningChunks: 0,  ← No reasoning!
  contentChunks: 145,
  finalContentLength: 5432
}
```

**Possible Causes:**
1. Reasoning not supported by model
2. Reasoning effort too low
3. API configuration issue

**How to Fix:**
- Check if model supports reasoning
- Increase effort level to "high"
- Remove reasoning config temporarily

### Issue 3: No Content Chunks

**Debug Output:**
```
✅ Stream completed: {
  totalEvents: 8,
  reasoningChunks: 8,
  contentChunks: 0,  ← No content!
  finalContentLength: 0
}
```

**Possible Causes:**
1. Wrong event type being listened to
2. Stream ended prematurely
3. API response format changed

**How to Fix:**
- Check event types in logs
- Verify API version compatibility
- Test without reasoning first

### Issue 4: Stream Timeout

**Debug Output:**
```
📡 Starting stream processing...
📨 Event #1: {...}
📨 Event #2: {...}
[No more events, hangs]
```

**Possible Causes:**
1. Network timeout
2. API rate limiting
3. Very long generation time

**How to Fix:**
- Check network connection
- Reduce verbosity setting
- Check OpenAI status page

---

## 📊 How to Use Debug Logs

### Step 1: Enable Development Mode
Make sure you're running in development:
```bash
NODE_ENV=development npm run dev
```

### Step 2: Trigger Generation
1. Go to `/generate` page
2. Enter a prompt
3. Click "Generate Document"

### Step 3: Monitor Console
Watch the server console for debug output:
```bash
# Terminal running dev server
🚀 Starting document generation...
📝 Config: { model: 'gpt-5', effort: 'medium', ... }
✅ Stream initialized successfully
📡 Starting stream processing...
...
```

### Step 4: Analyze Output

**Look for:**
- ✅ Green checkmarks = Success
- ❌ Red X's = Errors
- 📊 Numbers and stats = Progress

**Red Flags:**
- No "Stream initialized successfully"
- Zero reasoning or content chunks
- Errors with status 500
- Missing event types

### Step 5: Report Issues

**If you find an error, copy:**
1. The full error object
2. The request ID
3. The config that was used
4. The flow up to the error

**Example Bug Report:**
```
Config:
- Model: gpt-5
- Effort: medium
- Verbosity: high

Error:
❌ Failed to initialize stream: {
  message: "Internal server error",
  requestID: "req_e0243226de114c998b60022b5805d914",
  code: "internal_error",
  type: "internal_error"
}

Flow:
1. ✅ Config logged
2. ❌ Stream init failed
```

---

## 🔧 Testing Different Scenarios

### Test 1: Basic Generation (No Reasoning)
```typescript
// Temporarily remove reasoning in route.ts
const stream = await openai.responses.stream({
  model: "gpt-4o", // Change model
  input: prompt,
  instructions: systemPrompt,
  // reasoning: { ... }, ← Comment out
  text: {
    verbosity: verbosity as "low" | "medium" | "high",
  },
  stream: true,
});
```

**Expected Output:**
```
🚀 Starting document generation...
📝 Config: { model: 'gpt-4o', ... }
✅ Stream initialized successfully
📡 Starting stream processing...
✍️ Content chunk #1: {...}
...
✅ Stream completed: { contentChunks: 50+ }
```

### Test 2: Reasoning Only
```typescript
// Test with minimal content
const stream = await openai.responses.stream({
  model: "gpt-5",
  input: "Short prompt",
  instructions: "Brief response",
  reasoning: {
    effort: "high", // Max reasoning
  },
  text: {
    verbosity: "low", // Min content
  },
  stream: true,
});
```

**Expected Output:**
```
🧠 Reasoning chunk #1-5: {...}
✍️ Content chunk #1-2: {...}
✅ Stream completed: { reasoningChunks: 5+, contentChunks: 2 }
```

### Test 3: Event Type Discovery
```typescript
// In the stream processing, log ALL events
for await (const event of stream) {
  if (isDev) {
    console.log("🔍 Full event:", {
      type: event.type,
      keys: Object.keys(event),
      event: event, // Full object
    });
  }
  // ... rest of code
}
```

**Expected Output:**
```
🔍 Full event: {
  type: "response.start",
  keys: ["type", "response"],
  event: { ... }
}
🔍 Full event: {
  type: "response.reasoning_summary_text.delta",
  keys: ["type", "delta", "index"],
  event: { ... }
}
```

---

## 📝 Production vs Development

### Development Mode (NODE_ENV=development)
- ✅ All debug logs enabled
- ✅ Detailed error information
- ✅ Event previews
- ✅ Performance metrics

### Production Mode (NODE_ENV=production)
- ⚠️ Minimal logging
- ⚠️ Only error messages (no details)
- ⚠️ No event previews
- ⚠️ Basic metrics only

**Production Logs:**
```
Streaming error: Internal server error
Document generation error: Failed to generate document
```

**Development Logs:**
```
❌ Streaming error details: {
  message: "Internal server error",
  status: 500,
  code: "internal_error",
  requestID: "req_...",
  stack: "...",
  ...
}
```

---

## 🎯 Quick Checklist

When debugging streaming issues:

- [ ] Running in development mode?
- [ ] API key configured correctly?
- [ ] Check OpenAI dashboard for quota
- [ ] Is `gpt-5` model available?
- [ ] Try `gpt-4o` instead
- [ ] Remove reasoning config to test
- [ ] Check console for initialization
- [ ] Verify event types being received
- [ ] Check for reasoning chunks
- [ ] Check for content chunks
- [ ] Look for error details
- [ ] Copy request ID for support

---

## 🆘 Support Resources

### OpenAI API Status
- https://status.openai.com

### OpenAI Models
- Check available models in dashboard
- Verify `gpt-5` availability
- Test with `gpt-4o` or `gpt-4-turbo`

### API Documentation
- https://platform.openai.com/docs/api-reference/streaming
- Check for latest event types
- Verify reasoning API format

### Request IDs
- Found in error logs
- Use for OpenAI support tickets
- Format: `req_XXXXXXXXXXXXXXXXXXXX`

---

## 📌 Summary

**Debug logging now shows:**
1. ✅ Configuration and setup
2. ✅ Stream initialization
3. ✅ All event types
4. ✅ Reasoning chunks
5. ✅ Content chunks
6. ✅ Stream completion stats
7. ✅ Document save process
8. ✅ Detailed error information
9. ✅ Request IDs for support

**Only in development mode!**

**Next steps:**
1. Run the app in dev mode
2. Try generating a document
3. Watch console output
4. Identify where the flow breaks
5. Use error details to fix
