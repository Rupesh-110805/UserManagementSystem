# 🚀 Deployment Guide - User Management System

This guide provides step-by-step instructions for deploying the User Management System to production using Render (backend) and Vercel (frontend) with Neon PostgreSQL database.

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account with repository access
- ✅ Render account (sign up at https://render.com)
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ Neon PostgreSQL database (sign up at https://neon.tech)

## 🔐 Step 1: Setup Neon PostgreSQL Database

### 1.1 Get Database Connection String

1. Log in to your Neon dashboard (https://console.neon.tech)
2. Navigate to your project
3. Go to the **Connection Details** section
4. Copy the connection string. It should look like:
   ```
   postgresql://username:password@hostname/database?sslmode=require
   ```
5. **Important**: Make sure you copy the connection string that includes the **pooler** endpoint for best performance

### 1.2 Test Database Connection (Optional but Recommended)

You can test the connection locally before deploying:

```bash
# Navigate to backend directory
cd backend

# Update .env with your Neon database URL
# DATABASE_URL=postgresql://your-neon-connection-string

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

---

## 🔧 Step 2: Deploy Backend to Render

### 2.1 Prepare Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin master
```

### 2.2 Create Render Web Service

1. **Log in to Render** (https://dashboard.render.com)

2. **Click "New +"** → Select **"Web Service"**

3. **Connect GitHub Repository**:
   - Click "Connect account" if not connected
   - Select your `UserManagementSystem` repository

4. **Configure Web Service**:
   
   | Setting | Value |
   |---------|-------|
   | **Name** | `user-management-backend` (or your preferred name) |
   | **Region** | Select closest to your users (e.g., `US East`) |
   | **Branch** | `master` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `gunicorn config.wsgi` |
   | **Instance Type** | `Free` (or paid for better performance) |

5. **Click "Advanced"** and add environment variables:

### 2.3 Configure Environment Variables

Add the following environment variables in Render:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `SECRET_KEY` | Generate using Python command below | Keep this secure! |
| `DEBUG` | `False` | Must be False in production |
| `DATABASE_URL` | Your Neon PostgreSQL connection string | From Step 1.1 |
| `ALLOWED_HOSTS` | `.onrender.com` | Allows Render subdomain |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | Update after Step 3 |

**Generate SECRET_KEY**:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Run migrations (via `Procfile`)
   - Start the Gunicorn server

3. **Monitor deployment logs** to ensure success

4. **Note your backend URL**: `https://your-app-name.onrender.com`

### 2.5 Create Superuser on Production

After successful deployment, access Render shell:

1. Go to your web service dashboard
2. Click **"Shell"** tab
3. Run:
   ```bash
   python manage.py createsuperuser
   ```
4. Enter admin credentials when prompted

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Update Frontend Environment Configuration

1. Open `frontend/.env.production`
2. Update with your actual Render backend URL:
   ```env
   VITE_API_URL=https://your-backend-app.onrender.com/api
   ```

3. Commit and push changes:
   ```bash
   git add frontend/.env.production
   git commit -m "Update production API URL"
   git push origin master
   ```

### 3.2 Create Vercel Project

1. **Log in to Vercel** (https://vercel.com/dashboard)

2. **Click "Add New..."** → Select **"Project"**

3. **Import Git Repository**:
   - Click "Import" next to your repository
   - If not listed, click "Add GitHub Account" and authorize

4. **Configure Project**:

   | Setting | Value |
   |---------|-------|
   | **Project Name** | `user-management-frontend` (or your choice) |
   | **Framework Preset** | `Vite` |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` (auto-detected) |
   | **Output Directory** | `dist` (auto-detected) |

### 3.3 Add Environment Variables

In the "Environment Variables" section, add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://your-backend-app.onrender.com/api` |

Apply to: **Production**, **Preview**, and **Development**

### 3.4 Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Run the build
   - Deploy to CDN

3. **Note your frontend URL**: `https://your-app-name.vercel.app`

---

## 🔄 Step 4: Update CORS Settings

Now that you have both URLs, update backend CORS settings:

### 4.1 Update Render Environment Variable

1. Go to Render dashboard → Your web service
2. Navigate to **"Environment"** tab
3. Edit `CORS_ALLOWED_ORIGINS`:
   ```
   https://your-frontend-app.vercel.app
   ```
   (Remove the placeholder URL)

4. **Save Changes** → Render will automatically redeploy

### 4.2 Test CORS

After redeployment, your frontend should be able to communicate with the backend without CORS errors.

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Frontend

1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. You should see the homepage

### 5.2 Test Authentication

1. Try registering a new user
2. Try logging in with the superuser credentials
3. Navigate to admin dashboard (admin user only)

### 5.3 Test API Endpoints

Visit your backend API documentation:
- Health check: `https://your-backend.onrender.com/api/`
- Admin panel: `https://your-backend.onrender.com/admin/`

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Database Connection Errors**

**Error**: `OperationalError: connection failed`

**Solutions**:
- Verify DATABASE_URL is correct in Render environment variables
- Ensure Neon database is active (check Neon console)
- Check if database credentials are valid
- Verify `sslmode=require` is in connection string

#### 2. **CORS Errors in Browser Console**

**Error**: `Access to fetch blocked by CORS policy`

**Solutions**:
- Verify `CORS_ALLOWED_ORIGINS` includes your exact Vercel URL
- Ensure there are no trailing slashes in URLs
- Check that backend has redeployed after changing environment variables
- Verify `django-cors-headers` is in `INSTALLED_APPS`

#### 3. **Static Files Not Loading**

**Error**: Admin panel has no styling

**Solutions**:
- Verify `whitenoise` is installed and configured
- Check `STATIC_ROOT` and `STATIC_URL` in settings
- Ensure `collectstatic` runs during build (check Procfile)

#### 4. **Import Errors on Render**

**Error**: `ModuleNotFoundError`

**Solutions**:
- Verify all dependencies are in `requirements.txt`
- Check Python version matches `runtime.txt`
- Review Render build logs for specific missing packages

#### 5. **Frontend 404 Errors on Page Refresh**

**Error**: Page not found when refreshing non-home pages

**Solutions**:
- Verify `vercel.json` exists with proper rewrites configuration
- Ensure React Router is configured correctly

#### 6. **Environment Variables Not Loading**

**Error**: `undefined` or default values being used

**Solutions**:
- Verify environment variables are set in Render/Vercel dashboard
- Check variable names match exactly (case-sensitive)
- For Vercel, ensure variables are applied to "Production"
- Redeploy after adding environment variables

---

## 🔄 Continuous Deployment

Both Render and Vercel support automatic deployments:

### Auto-Deploy on Push

- **Render**: Automatically redeploys when you push to the `master` branch
- **Vercel**: Automatically redeploys on every push to `master`

### Manual Deployment

**Render**:
1. Go to web service dashboard
2. Click **"Manual Deploy"** → Select branch
3. Click **"Deploy"**

**Vercel**:
1. Go to project dashboard
2. Click **"Deployments"** tab
3. Click **"..."** → **"Redeploy"**

---

## 📊 Monitoring & Logs

### Render Logs

Access logs to monitor your backend:
1. Go to web service dashboard
2. Click **"Logs"** tab
3. View real-time logs

### Vercel Logs

Monitor frontend builds and runtime:
1. Go to project dashboard
2. Click **"Deployments"**
3. Click on any deployment → **"View Function Logs"**

---

## 🔒 Security Best Practices

### Post-Deployment Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` generated and secured
- [ ] Database credentials not committed to git
- [ ] CORS configured with specific origins (no wildcards)
- [ ] HTTPS enabled (automatic on Render/Vercel)
- [ ] Rate limiting configured (if needed)
- [ ] Regular security updates for dependencies

---

## 📝 Database Management

### Running Migrations

**On Render** (automatic via Procfile):
- Migrations run automatically on every deployment

**Manual migration** (if needed):
1. Go to Render dashboard → Shell
2. Run: `python manage.py migrate`

### Backup Database

**Neon provides automatic backups**:
1. Log in to Neon console
2. Navigate to **Backups** section
3. Configure backup retention period
4. Can restore to any point in time

### Create Additional Superusers

Via Render Shell:
```bash
python manage.py createsuperuser
```

---

## 🎯 Performance Optimization

### Backend (Render)

1. **Upgrade instance type** for better performance
2. **Enable Redis** for caching (optional)
3. **Configure connection pooling** in database settings
4. **Monitor response times** in Render dashboard

### Frontend (Vercel)

1. **Already optimized**: Vercel uses global CDN
2. **Enable Analytics**: Monitor Core Web Vitals
3. **Optimize images**: Use next-gen formats
4. **Code splitting**: Leverage Vite's automatic splitting

---

## 🔗 Useful Links

### Documentation
- **Django**: https://docs.djangoproject.com/
- **Django REST Framework**: https://www.django-rest-framework.org/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/

### Deployment Platforms
- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **Neon**: https://neon.tech/docs

### Tools
- **Postman**: Test API endpoints
- **pgAdmin**: Manage PostgreSQL database
- **VS Code**: Development environment

---

## 📧 Support

If you encounter issues not covered in this guide:

1. **Check logs** on Render and Vercel
2. **Review GitHub Issues** in repository
3. **Contact maintainer**: rupeshnidadavolu110805@gmail.com

---

## 🎉 Congratulations!

Your User Management System is now deployed and running in production!

### Next Steps

1. **Test all features** thoroughly
2. **Update README.md** with your live URLs
3. **Share with users** or submit for review
4. **Monitor performance** and logs
5. **Plan future enhancements**

### Live URLs Template

Update your README with:

```markdown
## 📱 Live Demo

- **Frontend**: https://your-app-name.vercel.app
- **Backend API**: https://your-backend.onrender.com/api
- **Admin Panel**: https://your-backend.onrender.com/admin

### Test Credentials
- **Admin**: admin@example.com / SecureAdminPass123!
- **User**: user@example.com / SecureUserPass123!
```

---

**Happy Deploying! 🚀**
