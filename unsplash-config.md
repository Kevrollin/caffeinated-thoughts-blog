# Unsplash API Configuration

## Environment Variables Setup

Create a `.env` file in the `caffeinated-thoughts-blog` directory with the following content:

```env
# Unsplash API Configuration
VITE_UNSPLASH_ACCESS_KEY=yAKmYOw0ProwA_3Hh2v5mZ10kM7tSd42cwBuel4T3kg
VITE_UNSPLASH_SECRET_KEY=X-FFKnETCr3zhx0I7od_iSbuI2u7xzCUv2NyzOhojfg
VITE_UNSPLASH_APP_ID=813801

# API Configuration
VITE_API_URL=http://localhost:4000
```

## For Production (Vercel)

Add these environment variables in your Vercel dashboard:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

- `VITE_UNSPLASH_ACCESS_KEY` = `yAKmYOw0ProwA_3Hh2v5mZ10kM7tSd42cwBuel4T3kg`
- `VITE_UNSPLASH_SECRET_KEY` = `X-FFKnETCr3zhx0I7od_iSbuI2u7xzCUv2NyzOhojfg`
- `VITE_UNSPLASH_APP_ID` = `813801`
- `VITE_API_URL` = `https://caffeinated-thoughts-backend.onrender.com`

## Features Available

With Unsplash integration, you can:

1. **Search for images** by keywords
2. **Browse popular categories** like technology, business, nature, etc.
3. **Get high-quality stock photos** for your blog posts
4. **Automatic attribution** to photographers
5. **Multiple image sizes** (small, regular, full)

## Usage

1. When creating/editing a post, click the "Image" button in the markdown editor
2. Search for images or browse categories
3. Click on an image to select it
4. Add custom alt text if needed
5. The image will be inserted as markdown: `![alt text](image_url)`

## API Limits

Your Unsplash app has the following limits:
- 50 requests per hour (demo app)
- For higher limits, consider upgrading your Unsplash app

## Security Note

Never commit your `.env` file to version control. The `.env` file should be in your `.gitignore`.
