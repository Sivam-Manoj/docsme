# 🚀 Docume AI

**AI-Powered Document Generation & Collaboration Platform**

A modern, full-stack SaaS application that leverages AI to create, edit, and share professional documents with a beautiful Canvas-like editor.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8?logo=tailwind-css)

## ✨ Features

### 🤖 AI-Powered Generation
- Generate professional documents from simple prompts using OpenAI GPT-4
- AI-assisted content rewriting and refinement
- Smart document suggestions

### 🎨 Canvas-Like Editor
- Rich text editing with real-time formatting
- Font family, size, and color customization
- Text alignment controls (left, center, right, justify)
- Background color customization
- Select and edit specific text sections
- Responsive design for all devices

### 🔐 Authentication & Security
- Email/Password authentication with verification
- Google OAuth integration
- Secure password hashing with bcrypt
- Protected routes with NextAuth middleware
- Session management

### 📧 Email System
- Welcome emails for new users
- Email verification with Resend SDK
- Beautiful HTML email templates
- Password reset functionality

### 🔗 Document Sharing
- Generate shareable links
- Optional password protection for documents
- Public/private document settings
- View counter tracking
- Copy-to-clipboard functionality

### 💾 Export Options
- Download as PDF
- Export as PNG image
- Share via public link
- Direct document access

### 💳 Payment Integration
- Stripe subscription system
- Free, Pro, and Enterprise plans
- Usage-based document limits
- Secure webhook handling

### 📊 Dashboard
- View all your documents
- Quick access to edit and delete
- Document analytics (views, created date)
- Beautiful card-based layout

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide Icons** - Beautiful icon library
- **React Hot Toast** - Elegant notifications

### Backend
- **Next.js API Routes** - Serverless functions
- **NextAuth** - Authentication solution
- **MongoDB & Mongoose** - Database & ODM
- **OpenAI API** - AI document generation
- **Stripe** - Payment processing
- **Resend** - Email delivery

### Additional Libraries
- **jsPDF & html2canvas** - PDF/Image generation
- **Axios** - HTTP client
- **bcryptjs** - Password hashing

## 📦 Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd documeai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory (see `ENV_SETUP.md` for detailed instructions):

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Resend
RESEND_API_KEY=your_resend_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
documeai/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── documents/    # Document CRUD & AI
│   │   ├── shared/       # Public document access
│   │   └── stripe/       # Payment webhooks
│   ├── auth/             # Auth pages (login, register, verify)
│   ├── dashboard/        # User dashboard
│   ├── editor/[id]/      # Document editor
│   ├── shared/[link]/    # Public document viewer
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # Reusable UI components
│   ├── navbar.tsx        # Navigation bar
│   └── providers.tsx     # Context providers
├── lib/
│   ├── db.ts             # MongoDB connection
│   ├── email.ts          # Email utilities
│   └── utils.ts          # Helper functions
├── models/               # Mongoose schemas
│   ├── User.ts
│   ├── Document.ts
│   └── VerificationToken.ts
├── types/                # TypeScript definitions
├── auth.config.ts        # NextAuth configuration
├── auth.ts               # NextAuth instance
└── middleware.ts         # Route protection

```

## 🎯 Key Features Explained

### Document Generation Flow
1. User enters a prompt describing the document
2. OpenAI GPT-4 generates professional content
3. Document is saved with unique shareable link
4. User can edit in the Canvas-like editor

### Editor Features
- **Text Selection**: Select any text to rewrite with AI
- **Formatting Toolbar**: Font size, family, colors, alignment
- **AI Rewrite Panel**: Refine content with AI assistance
- **Real-time Saving**: Auto-save functionality
- **Export Options**: PDF, PNG, or shareable link

### Sharing System
- **Public Links**: Generate unique shareable URLs
- **Password Protection**: Optional password for sensitive docs
- **View Analytics**: Track document views
- **Copy Link**: One-click link copying

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT-based session management
- Protected API routes
- CSRF protection
- Environment variable security
- MongoDB injection prevention
- Rate limiting ready

## 💰 Subscription Plans

### Free Tier
- 5 documents per month
- Basic AI generation
- PDF export
- Public sharing

### Pro ($19.99/month)
- 100 documents per month
- Advanced AI generation
- All export formats
- Password protection
- Priority support

### Enterprise ($99.99/month)
- Unlimited documents
- Premium AI models
- Custom branding
- API access
- Dedicated support
- Team collaboration

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy automatically

### Environment Setup
Ensure all environment variables from `.env.local` are added to your hosting platform.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Email verification
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Documents
- `POST /api/documents/generate` - Generate document
- `GET /api/documents/list` - List user documents
- `GET /api/documents/[id]` - Get document
- `PATCH /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document
- `POST /api/documents/rewrite` - AI rewrite

### Sharing
- `GET /api/shared/[link]` - Get shared document
- `POST /api/shared/[link]` - Unlock with password

### Payments
- `POST /api/stripe/create-checkout` - Create checkout
- `POST /api/stripe/webhook` - Handle webhooks

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- OpenAI for GPT-4 API
- Vercel for hosting
- All open-source contributors

## 📞 Support

For support, email support@documeai.com or open an issue on GitHub.

---

**Built with ❤️ using Next.js, TypeScript, and AI**
