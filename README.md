# VR What More - Landing Page

A high-converting landing page for the exclusive "More Movement" community by Vijay Raja.

## 🚀 Features

- **Modern Design**: Luxury black and gold theme with smooth animations
- **Multi-step Form**: Professional 2-step form with validation
- **Database Integration**: Supabase backend for form data storage
- **Analytics**: Google Analytics integration
- **Mobile Responsive**: Optimized for all devices
- **SEO Optimized**: Meta tags and structured data

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Analytics**: Google Analytics
- **Version Control**: GitHub

## 📋 Prerequisites

- Node.js (v16 or higher)
- Git
- Supabase account
- Vercel account
- GitHub account

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/vr-what-more-landing.git
cd vr-what-more-landing
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Run the database schema:

```bash
# Copy the contents of supabase-schema.sql and run it in your Supabase SQL editor
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to see your site.

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables in Vercel Dashboard**:
   - Go to your project settings
   - Add environment variables:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`

### Alternative: Deploy via GitHub

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

## 📊 Database Schema

The application uses three main tables:

### `basic_info`
- `id` (UUID, Primary Key)
- `full_name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `phone` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `professional_details`
- `id` (UUID, Primary Key)
- `basic_info_id` (UUID, Foreign Key)
- `primary_area` (VARCHAR)
- `experience_years` (VARCHAR)
- `organization` (VARCHAR)
- `role` (VARCHAR)
- `values` (TEXT[])
- `priorities` (TEXT[])
- `biggest_challenge` (VARCHAR)
- `street_address` (TEXT)
- `city` (VARCHAR)
- `state` (VARCHAR)
- `pin_code` (VARCHAR)
- And more fields...

### `signup_stats`
- `id` (UUID, Primary Key)
- `count` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔧 Configuration

### Google Analytics

The Google Analytics tracking code is already included in the HTML. Update the tracking ID in `index.html`:

```html
gtag('config', 'G-YKNZ4W9DFQ'); // Replace with your GA4 tracking ID
```

### Supabase Configuration

Update the Supabase configuration in `supabase-config.js`:

```javascript
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
```

## 📱 Form Features

- **Step 1**: Basic information (Name, Email, Phone)
- **Step 2**: Professional details with multiple sections:
  - Professional Information
  - Values & Priorities
  - Key Challenge
  - Address
  - Personal Touch
  - Special Connection

## 🎨 Customization

### Colors
Update CSS variables in `index.html`:

```css
:root {
    --primary: #0a0a0a;
    --secondary: #1a1a1a;
    --accent: #d4af37;
    /* ... more variables */
}
```

### Content
- Update text content in `index.html`
- Modify form fields in the HTML structure
- Update footer links and social media URLs

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Environment variables for sensitive data
- Input validation and sanitization
- HTTPS enforced in production

## 📈 Analytics & Monitoring

- Google Analytics 4 integration
- Form submission tracking
- User behavior monitoring
- Conversion tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email info@vijayraja.com or create an issue in this repository.

## 🔄 Updates

- **v1.0.0**: Initial release with form functionality
- **v1.1.0**: Added Supabase integration
- **v1.2.0**: Enhanced UI and mobile responsiveness

---

Built with ❤️ by [Vijay Raja](https://vijayraja.com) 