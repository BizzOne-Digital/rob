# Email Setup Guide

The website sends these types of emails:
1. **Customer Order Confirmation** - "Thank you for your order" with full order details
2. **Admin Order Notification** - New order alert with customer info, shipping address, and order details
3. **Contact Form Responses** - Customer inquiry notifications to admin email
4. **Custom Request Notifications** - When customers submit custom creation requests

## Option 1: Resend (Recommended - Easiest)

Resend is a modern email API service that's simple to set up.

### Steps:

1. **Create Resend Account**
   - Go to: https://resend.com/signup
   - Sign up with your email

2. **Verify Your Domain** (Optional but recommended)
   - Add DNS records for your domain
   - OR use the default Resend domain for testing

3. **Get API Key**
   - Dashboard → API Keys → Create API Key
   - Copy the key (starts with `re_`)

4. **Add to .env.local:**
```bash
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=RW Designs Canada <noreply@yourdomain.com>
CONTACT_RECIPIENT_EMAIL=rwdesignscanada@gmail.com
```

### Pricing:
- **Free tier:** 100 emails/day, 3,000/month
- **Paid:** $20/month for 50,000 emails

---

## Option 2: SMTP (Traditional Email Server)

If you want to use your own email server (Gmail, Office 365, etc.)

### Using Gmail SMTP:

1. **Enable 2-Step Verification** on your Gmail account

2. **Create App Password:**
   - Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail" on "Other device"

3. **SMTP Settings:**
```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: [app password from step 2]
```

### Using Office 365 / Outlook SMTP:

```
Host: smtp.office365.com
Port: 587
Username: your-email@yourdomain.com
Password: [your email password]
```

### For SMTP Implementation:

I can switch from Resend to SMTP if needed. Just provide:
- SMTP Host
- SMTP Port
- SMTP Username (email)
- SMTP Password (or app password)

---

## Current Environment Variables Needed:

```bash
# Email Configuration
RESEND_API_KEY=                          # Get from resend.com
EMAIL_FROM=RW Designs Canada <noreply@yourdomain.com>
CONTACT_RECIPIENT_EMAIL=rwdesignscanada@gmail.com  # Where order notifications go
```

## What Each Email Contains:

### 1. Customer Order Confirmation
**Subject:** "Order confirmation #12345 — RW Designs Canada"
**To:** Customer's email
**Contains:**
- Thank you message
- Order number
- Payment status
- All items ordered (with personalization details)
- Quantities, prices, total
- Shipping address
- Billing address
- Customer notes (if any)

### 2. Admin Order Notification
**Subject:** "New order #12345 — Customer Name"
**To:** Admin email (CONTACT_RECIPIENT_EMAIL)
**Contains:**
- Order number
- Customer name, email, phone
- Payment status
- All items ordered
- Subtotal, discount, shipping, tax, total
- Full shipping address
- Full billing address
- Customer notes

### 3. Contact Form Response
**Subject:** "New inquiry from [Name] ([Type])"
**To:** Admin email
**Reply-To:** Customer's email
**Contains:**
- Customer name
- Customer email
- Inquiry type (General, Custom order, etc.)
- Full message

## Testing Emails:

Once you add the API key:
1. Place a test order → Check if customer and admin both receive emails
2. Submit contact form → Check if admin receives inquiry
3. Verify all details are showing correctly

---

## Which Should You Choose?

**Choose Resend if:**
- ✅ You want simple setup (just one API key)
- ✅ You want reliable delivery
- ✅ Free tier is enough for your volume
- ✅ You don't want to manage email server settings

**Choose SMTP if:**
- ✅ You already have email hosting
- ✅ You want emails to come from your actual business email
- ✅ You prefer traditional email infrastructure

**My Recommendation:** Start with Resend (easier), switch to SMTP later if needed.
