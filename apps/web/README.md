# Frontend - cvecarairig.rs Web Application

Next.js App Router storefront and protected admin dashboard for cvecarairig.rs. Current status: pre-production e-commerce foundation wired to backend API contracts, canonical guest checkout, protected admin proxy, SEO metadata, sitemap, robots, and Cloudinary image allow-listing.

## 🚀 Quick Start

```bash
# Install dependencies
npm ci

# Create environment file
cp .env.example .env.local

# Start development server (port 3000)
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
web/
├── app/
│   ├── page.tsx               # Homepage
│   ├── products/              # Products listing and detail routes
│   ├── cart/                  # Shopping cart
│   ├── checkout/              # Checkout and success routes
│   ├── about/                 # About page
│   ├── contact/               # Contact page
│   ├── shipping/              # Shipping page
│   ├── returns/               # Returns page
│   ├── flower-care/            # Flower care page
│   ├── privacy-policy/        # Privacy policy
│   ├── terms-and-conditions/  # Terms
│   └── admin/
│       ├── login/             # Admin login
│       └── dashboard/         # Admin dashboard
├── components/                # Reusable React components
├── styles/                    # Global CSS styles
├── public/                    # Static assets
├── package.json              # Dependencies
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── .env.local                # Environment variables
```

## 🛠️ Available Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run linter
npm run type-check   # TypeScript type checking
```

## 🎨 Styling

Using **Tailwind CSS** for utility-first styling:
- Configuration: `tailwind.config.js`
- Global styles: `styles/globals.css`

## 🌍 Environment Configuration

```env
# .env.local
API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BRAND_NAME=Online Cvećara Irig
NEXT_PUBLIC_DEFAULT_LOCALE=sr
NEXT_PUBLIC_INSTAGRAM_URL=
NEXT_PUBLIC_FACEBOOK_URL=
NEXT_PUBLIC_CONTACT_EMAIL=cvecaralotos022@gmail.com
NEXT_PUBLIC_LOGO_URL=
```

## 📝 Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `app/page.tsx` | Homepage with overview |
| `/products` | `app/products/page.tsx` | Product listing from API |
| `/products/[slug]` | `app/products/[slug]/page.tsx` | Product detail from API |
| `/cart` | `app/cart/page.tsx` | Shopping cart |
| `/checkout` | `app/checkout/page.tsx` | Guest checkout process |
| `/checkout/success` | `app/checkout/success/page.tsx` | Checkout success page |
| `/about` | `app/about/page.tsx` | About company |
| `/contact` | `app/contact/page.tsx` | Contact form |
| `/privacy-policy` | `app/privacy-policy/page.tsx` | Privacy policy |
| `/terms-and-conditions` | `app/terms-and-conditions/page.tsx` | Terms & conditions |
| `/admin/login` | `app/admin/login/page.tsx` | Admin login |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | Protected admin dashboard |

## 🔗 API Integration

Frontend communicates with the backend through `NEXT_PUBLIC_API_BASE_URL` for public API calls and `API_BASE_URL` for server-side/admin proxy calls. Public checkout uses `/api/v1/orders/guest-checkout`; there must be no public storefront call to legacy `/api/v1/orders/checkout`.

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// Example public API call
fetch(`${apiUrl}/api/v1/products`)
  .then(r => r.json())
  .then(data => console.log(data));

// Admin calls go through /api/admin/proxy and the proxy preserves upload bodies with request.arrayBuffer().
```

## 🧪 Testing (Planned)

```bash
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 📦 Dependencies

- **next**: React framework
- **react**: UI library
- **typescript**: Type safety
- **tailwindcss**: Styling
- **autoprefixer**: CSS processing
- **postcss**: CSS transformations

## 🚀 Deployment

### Netlify
Configuration in `netlify.toml` at project root.

```bash
npm ci
npm run lint
npm run type-check
npm run build
```

### Vercel
```bash
vercel deploy
```

## 📖 Next.js Features Used

- **App Router**: File-based routing
- **TypeScript**: Full type support
- **Image Optimization**: Built-in image component
- **API Routes**: Backend integration
- **Environment Variables**: Configuration management
- **CSS Modules & Tailwind**: Styling solutions

## 🔐 Security

- Environment variables for API URLs
- TypeScript strict mode
- Input validation on forms
- Protected admin routes and admin proxy
- `next.config.js` image allow-list limited to `res.cloudinary.com` for Cloudinary product media

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
```

### API connection issues
- Ensure backend is running on `http://localhost:8000`
- Check `.env.local` has correct `NEXT_PUBLIC_API_BASE_URL`
- Verify CORS is configured in backend

---

**Status**: Pre-production e-commerce foundation
**Last Updated**: May 2026


## Inventory display rules

- Products with active variants display availability by variant and require customers to select a size/color before adding to cart.
- Cart lines preserve the selected variant label so stock warnings refer to the chosen variant/artikal.
- Simple products without variants use product-level stock.
