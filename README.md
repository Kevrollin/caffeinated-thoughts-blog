# ☕ Caffeinated Thoughts - Frontend

A beautiful, modern blogging platform with integrated M-Pesa payments, built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- 📝 **Markdown Blog Posts** - Rich text editing with syntax highlighting
- ☕ **Buy Me a Coffee** - M-Pesa STK Push integration
- 🎨 **Beautiful Design** - Coffee-themed UI with smooth animations
- 🌙 **Dark Mode** - Light and dark theme support
- 📱 **Responsive** - Mobile-first design
- 🔐 **Admin Dashboard** - Secure post management
- 💳 **Transaction Tracking** - Monitor all coffee purchases
- ⚡ **Fast & Modern** - Built with Vite and React

## 🎨 Design System

### Colors
- **Light Background**: #FDF6EC (Cream)
- **Dark Background**: #0F1115 (Charcoal)
- **Primary**: #6F4E37 (Coffee Brown)
- **Accent**: #2ECC71 (Emerald)
- **Secondary**: #E6A157 (Amber)

### Fonts
- **Headings**: Playfair Display
- **Body**: Inter

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (see backend setup)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd caffeinated-thoughts
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_SITE_NAME=Caffeinated Thoughts
VITE_SITE_DESCRIPTION=A blog fueled by coffee and curiosity
VITE_DEFAULT_COFFEE_AMOUNTS=[50,100,200]
```

4. **Start the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── Header.tsx       # Site header with navigation
│   ├── Footer.tsx       # Site footer
│   ├── PostCard.tsx     # Post preview card
│   ├── BuyCoffeeModal.tsx   # M-Pesa payment modal
│   └── AdminLayout.tsx  # Admin dashboard layout
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   └── ThemeContext.tsx # Theme management
├── lib/                 # Utilities
│   ├── api.ts          # Axios client with interceptors
│   └── utils.ts        # Helper functions
├── pages/              # Page components
│   ├── Home.tsx        # Homepage with post grid
│   ├── PostDetail.tsx  # Individual post page
│   ├── About.tsx       # About page
│   ├── Categories.tsx  # Categories page
│   ├── Login.tsx       # Admin login
│   └── admin/          # Admin pages
│       ├── Dashboard.tsx     # Admin dashboard
│       ├── PostsList.tsx     # Posts management
│       ├── Transactions.tsx  # Transactions view
│       └── Settings.tsx      # Settings page
└── App.tsx             # Main app component with routing
```

## 🔌 API Integration

The frontend connects to the backend API with the following key endpoints:

### Public Endpoints
- `GET /posts` - List published posts
- `GET /posts/:slug` - Get single post

### Admin Endpoints (requires authentication)
- `POST /auth/login` - Admin login
- `POST /auth/logout` - Logout
- `GET /admin/stats` - Dashboard statistics
- `GET /admin/posts` - List all posts
- `POST /admin/posts` - Create new post
- `PUT /admin/posts/:id` - Update post
- `DELETE /admin/posts/:id` - Delete post
- `GET /admin/transactions` - List transactions

### Payment Endpoints
- `POST /payments/stkpush` - Initiate M-Pesa payment
- `GET /payments/:id/status` - Check payment status

## 🔐 Authentication

The app uses JWT-based authentication with refresh tokens:

1. Login credentials are sent to `/auth/login`
2. Access token is stored in localStorage
3. Refresh token is stored as httpOnly cookie
4. Axios interceptor automatically refreshes expired tokens
5. Failed refresh redirects to login page

### Default Admin Credentials
```
Email: kelvinmukaria2023@gmail.com
Password: Kevdev@2025
```

## 💳 M-Pesa Integration

### How It Works

1. User clicks "Buy Me a Coffee" button
2. Modal opens with amount selection and phone input
3. Phone number is validated (Kenyan format: 07XXXXXXXX or 254XXXXXXXX)
4. STK Push is sent to user's phone
5. Frontend polls payment status every 2 seconds
6. Success/failure message is displayed

### Testing M-Pesa

For development and testing with Daraja Sandbox:

1. **Set up ngrok** to expose your backend:
```bash
ngrok http 4000
```

2. **Update Daraja callback URL** in your Safaricom developer portal:
```
https://your-ngrok-url.ngrok.io/api/v1/mpesa/callback
```

3. **Use Safaricom test credentials**:
   - Test Phone: Use any number in sandbox
   - PIN: 1234 (sandbox default)

## 📦 Build & Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel
1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Deploy to Netlify
1. Push your code to GitHub
2. Import project in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set environment variables
6. Deploy!

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

This project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components

## 🎨 Customization

### Update Colors

Edit `src/index.css`:
```css
:root {
  --coffee: 25 32% 32%;
  --emerald: 145 63% 49%;
  --amber: 33 72% 63%;
  /* ... other colors */
}
```

### Update Fonts

Edit `src/index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Your+Font');
```

Then update `tailwind.config.ts`:
```ts
fontFamily: {
  heading: ['Your Font', 'serif'],
  body: ['Another Font', 'sans-serif'],
}
```

### Update Default Coffee Amounts

Edit `.env`:
```env
VITE_DEFAULT_COFFEE_AMOUNTS=[25,50,100,200]
```

## 🐛 Troubleshooting

### CORS Errors
Make sure your backend has CORS configured to allow requests from your frontend origin.

### M-Pesa Payment Not Working
1. Check that backend Daraja credentials are correct
2. Verify ngrok is running and callback URL is updated
3. Ensure phone number is in correct format (254XXXXXXXXX)
4. Check backend logs for error details

### Auth Token Expired
The app automatically refreshes tokens. If issues persist:
1. Clear localStorage
2. Clear cookies
3. Login again

## 📝 License

MIT License - feel free to use this project for your own blog!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@caffeinated-thoughts.com

---

Made with ☕ and ❤️ by Caffeinated Thoughts
