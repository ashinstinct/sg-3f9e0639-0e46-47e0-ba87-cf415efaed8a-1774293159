---
title: AI Chat Agent page with multi-model support
status: todo
priority: high
type: feature
tags: [chat, ai, agents]
created_by: agent
created_at: 2026-04-21
position: 3
---

## Notes
Inspired by use.ai chat interface: Create a chat page at /chat with a model dropdown at top (Claude Sonnet 4.6, GPT-5.4, Gemini 3.1 Pro, Qwen 3 Max, Llama 3.3, etc.). Chat interface with message input, send button, mic icon, and quick action pills (Help me write, Learn about, Analyze). Center text says "How can I help you?" when empty.

## Checklist
- [ ] Create /chat page with full-screen chat layout
- [ ] Model dropdown at top center with all AI models grouped by provider
- [ ] Chat message list with user/assistant bubbles
- [ ] Input bar at bottom with + button, text input, mic icon, send button
- [ ] Quick action pills below input (Help me write, Learn about, Analyze image)
- [ ] Create /api/chat endpoint that routes to correct AI provider
- [ ] Support image/file uploads in chat for vision models
- [ ] Add Chat link to navigation sidebar

## Acceptance
- User can select different AI models from dropdown
- Messages send and receive responses
- Chat history displays properly on mobile