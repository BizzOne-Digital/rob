# Square Payment Integration Setup

This guide explains how to set up Square payments for RW Designs Canada.

## Prerequisites

- Square Developer Account (https://developer.squareup.com/)
- Square Application created in the Developer Dashboard

## Required API Keys

You need 4 API keys from Square:

### 1. Square Access Token
**Location:** Square Dashboard → Developer → Applications → Your App → Credentials

- **Sandbox Access Token** (for testing): Starts with `EAAAl...`
- **Production Access Token** (for live): Starts with `EAAAl...`

Add to `.env.local`:
```
SQUARE_ACCESS_TOKEN=your_access_token_here
```

### 2. Square Application ID
**Location:** Square Dashboard → Developer → Applications → Your App → Credentials

- **Sandbox Application ID** (for testing)
- **Production Application ID** (for live)

Add to `.env.local`:
```
NEXT_PUBLIC_SQUARE_APPLICATION_ID=your_application_id_here
```

### 3. Square Location ID
**Location:** Square Dashboard → Locations

- Each business location has a unique ID
- You can also get this via API once authenticated

Add to `.env.local`:
```
SQUARE_LOCATION_ID=your_location_id_here
```

### 4. Square Webhook Signature Key
**Location:** Square Dashboard → Developer → Webhooks

- Used to verify webhook authenticity
- Generate a signature key for your webhook endpoint

Add to `.env.local`:
```
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key_here
```

## Webhook Setup

### 1. Configure Webhook URL

In Square Developer Dashboard → Webhooks, add your webhook URL:

**Production:**
```
https://yourdomain.com/api/webhooks/square
```

**Development (using ngrok or similar):**
```
https://your-ngrok-url.ngrok.io/api/webhooks/square
```

### 2. Subscribe to Events

Subscribe to the following event:
- `payment.updated` - Notifies when payment status changes

## Testing

### Using Sandbox Mode

1. Set `NODE_ENV=development` in your environment
2. Use Sandbox credentials in `.env.local`
3. Test with Square's test card numbers:
   - **Success:** `4111 1111 1111 1111`
   - **Decline:** `4000 0000 0000 0002`

### Test Payment Flow

1. Add items to cart
2. Go to checkout
3. Fill in shipping details
4. Click "Proceed to Payment"
5. You'll be redirected to Square's payment page
6. Enter test card details
7. Complete payment
8. You'll be redirected back to order confirmation

## Production Deployment

1. Switch to Production credentials in environment variables
2. Set `NODE_ENV=production`
3. Update webhook URL in Square Dashboard to production domain
4. Test with a small real transaction first

## Environment Variables Summary

```bash
# Square Payment
SQUARE_ACCESS_TOKEN=EAAAl...  # From Square Dashboard
SQUARE_LOCATION_ID=L...        # From Square Locations
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sq0idp-...  # From Square App
SQUARE_WEBHOOK_SIGNATURE_KEY=...  # From Square Webhooks
```

## Troubleshooting

### Payment Link Not Generated
- Verify all environment variables are set correctly
- Check Square Dashboard for API errors
- Ensure Location ID is correct

### Webhook Not Receiving Events
- Verify webhook URL is accessible from internet
- Check webhook signature key is correct
- Review webhook logs in Square Dashboard

### Payment Status Not Updating
- Confirm webhook is subscribed to `payment.updated` event
- Check server logs for webhook processing errors
- Verify order exists with correct `squareOrderId`

## Support

For Square API documentation, visit:
https://developer.squareup.com/docs

For issues with this integration, contact your development team.
