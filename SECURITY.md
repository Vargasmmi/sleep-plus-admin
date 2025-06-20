# Security Configuration

## Important: API Keys and Sensitive Data

This project contains test files that require API keys to function. For security reasons, these keys have been removed from the source code.

### Before Running Test Scripts

1. Create a `.env` file based on `.env.example`
2. Add your actual API keys:
   - `SHOPIFY_ACCESS_TOKEN`: Your Shopify private app access token
   - `STRIPE_SECRET_KEY`: Your Stripe secret key

### For Production Deployment

- Never commit API keys or sensitive data to the repository
- Use environment variables for all sensitive configuration
- Update `db.json` with your actual credentials after deployment

### Test Files

The following test files require environment variables:
- `test-shopify/check-permissions.js`
- `test-shopify/test-direct-api.js`
- `test-shopify/test-proxy-server.js`
- `test-shopify/update-settings.js`

These files will use the environment variables if available, otherwise they'll use placeholder values.
