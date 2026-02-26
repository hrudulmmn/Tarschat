# 💬 Tars Chat — Full-Stack Real-Time Chat App

A complete real-time messaging application built with Next.js 14, Convex, and Clerk.

## Features

- ✅ Authentication (Clerk — email + social login)
- ✅ User list with real-time search
- ✅ 1-on-1 direct messages (real-time via Convex)
- ✅ Message timestamps (smart: time only, date+time, or with year)
- ✅ Empty states for all views
- ✅ Responsive layout (mobile sidebar ↔ full-screen chat)
- ✅ Online/Offline status (real-time green indicator)
- ✅ Typing indicator (with pulsing dots animation)
- ✅ Unread message count badges (cleared on open)
- ✅ Smart auto-scroll + "↓ New messages" button
- ✅ Delete own messages (soft delete, shows "This message was deleted")
- ✅ Message reactions (👍❤️😂😮😢 — toggle on/off)
- ✅ Loading skeletons + error states with retry
- ✅ Group chat (create with multiple members + group name)

---

## Setup (Step by Step)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Clerk

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) → Create Application
2. Enable **Email**, **Google**, or other social providers
3. Go to **JWT Templates** → Create a new template:
   - Name it `convex`
   - Under **Claims**, add: `{ "sub": "{{user.id}}" }`
4. Under **Domains**, note your JWT Issuer Domain (looks like `https://xxx.clerk.accounts.dev`)
5. Copy your **Publishable Key** and **Secret Key**

### 3. Set up Convex

```bash
npx convex dev
```

This will:
- Ask you to log in to Convex
- Create a new project
- Generate `NEXT_PUBLIC_CONVEX_URL`

### 4. Configure environment variables

Edit `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://....convex.cloud
CLERK_JWT_ISSUER_DOMAIN=https://...clerk.accounts.dev
```

### 5. Set Clerk auth in Convex

In your Convex dashboard, go to **Settings → Authentication** and add:

| Domain | Application ID |
|--------|---------------|
| `https://xxx.clerk.accounts.dev` | `convex` |

Or the `auth.config.ts` file handles this automatically if `CLERK_JWT_ISSUER_DOMAIN` is set.

### 6. Run the app

```bash
npm run dev
```

This starts both Next.js (port 3000) and the Convex dev server concurrently.

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
tars-chat/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Redirect to /chat or /sign-in
│   ├── sign-in/page.tsx     # Clerk sign-in page
│   ├── sign-up/page.tsx     # Clerk sign-up page
│   └── chat/
│       ├── layout.tsx       # Auth guard
│       └── page.tsx         # Main chat page
├── components/
│   ├── layout/
│   │   └── ChatLayout.tsx   # Responsive sidebar + chat area
│   └── chat/
│       ├── Sidebar.tsx      # Conversations list + tabs
│       ├── ConversationItem.tsx
│       ├── ChatArea.tsx     # Message thread
│       ├── Message.tsx      # Individual message with reactions
│       ├── TypingIndicator.tsx
│       ├── UserSearch.tsx
│       ├── Avatar.tsx
│       └── CreateGroupModal.tsx
├── convex/
│   ├── schema.ts            # Database tables
│   ├── auth.config.ts       # Clerk JWT config
│   ├── users.ts             # User queries/mutations
│   ├── conversations.ts     # Conversation logic
│   ├── messages.ts          # Message CRUD + reactions
│   ├── readReceipts.ts      # Unread count tracking
│   └── typing.ts            # Typing indicators
├── hooks/
│   ├── useCurrentUser.ts    # Sync Clerk user → Convex
│   └── useOnlineStatus.ts   # Online/offline tracking
└── lib/
    ├── providers.tsx        # ConvexClerkProvider wrapper
    └── utils.ts             # Helpers + date formatting
```

---

## Deployment to Vercel

1. Push your code to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Add all `.env.local` variables to Vercel Environment Variables
4. Deploy: `npx convex deploy` (for production Convex deployment)
5. Update Clerk's **Allowed Redirect URLs** to include your Vercel domain

---

## Tech Stack

| | |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript |
| **Styling** | Tailwind CSS |
| **Auth** | Clerk |
| **Backend/DB** | Convex (real-time subscriptions) |
| **Icons** | Lucide React |
| **Deployment** | Vercel + Convex Cloud |
