<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support — CheckoutFlow</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #333; line-height: 1.7; }
        h1 { color: #1a1a2e; border-bottom: 3px solid #5c6bc0; padding-bottom: 12px; }
        h2 { color: #3949ab; margin-top: 36px; }
        h3 { color: #5c6bc0; margin-top: 24px; }
        ul { padding-left: 24px; }
        li { margin-bottom: 6px; }
        .meta { color: #888; font-size: 14px; margin-bottom: 40px; }
        .contact-box { background: #f0f3ff; border-left: 4px solid #5c6bc0; padding: 20px 24px; border-radius: 4px; margin: 32px 0; }
        a { color: #3949ab; }
        code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 14px; color: #c0392b; }
    </style>
</head>
<body>
    <h1>Support & Help Center</h1>
    <p class="meta">CheckoutFlow — Average response time: under 24 hours</p>

    <div class="contact-box">
        <strong>📧 Email Support:</strong> <a href="mailto:support@checkoutflow.app">support@checkoutflow.app</a><br>
        <strong>🕐 Response Time:</strong> Within 24 hours (Mon–Fri)
    </div>

    <h2>Getting Started</h2>
    <h3>Installation</h3>
    <ul>
        <li>Install CheckoutFlow from the Shopify App Store</li>
        <li>The checkout modal script is automatically injected — no theme editing required</li>
        <li>Customize the modal from your app dashboard</li>
        <li>Test by adding a product to cart and clicking Checkout — the modal should appear</li>
    </ul>

    <h3>Verify the Script is Working</h3>
    <ul>
        <li>Open your storefront and press <strong>F12</strong></li>
        <li>Go to the <strong>Console</strong> tab</li>
        <li>Type <code>window.CheckoutFlow</code> and press Enter</li>
        <li>You should see an object — if you see <code>undefined</code>, see Troubleshooting below</li>
    </ul>

    <h2>Frequently Asked Questions</h2>

    <h3>Does it work with all Shopify themes?</h3>
    <p>Yes. CheckoutFlow uses the ScriptTag API and works with any published theme including Dawn and custom themes. No manual code editing required.</p>

    <h3>Will it slow down my store?</h3>
    <p>No. The script loads asynchronously and deferred, so it doesn't block page rendering.</p>

    <h3>Does it work with Shopify's native checkout?</h3>
    <p>CheckoutFlow displays a modal before the customer proceeds to Shopify's checkout. It does not modify Shopify's checkout process itself.</p>

    <h3>Will it break if I change my theme?</h3>
    <p>No. Since the script is injected via the ScriptTag API (not embedded in theme files), it works regardless of which theme is active.</p>

    <h2>Troubleshooting</h2>

    <h3>window.CheckoutFlow is undefined</h3>
    <ul>
        <li>Open DevTools (F12) > Network tab, refresh, and filter by <code>modal</code></li>
        <li>If the script returns <strong>404</strong>, the URL is outdated — contact support</li>
        <li>If <strong>200</strong> but still undefined, check Console for JavaScript errors</li>
        <li>Try uninstalling and reinstalling the app to re-register the script</li>
    </ul>

    <h3>Modal doesn't appear on Checkout</h3>
    <ul>
        <li>Confirm <code>window.CheckoutFlow</code> is defined</li>
        <li>Disable browser extensions (ad blockers) and test in incognito mode</li>
        <li>Contact support with your store URL and a description of the issue</li>
    </ul>

    <h3>401 Unauthorized error</h3>
    <ul>
        <li>Try logging out and back in to the app dashboard</li>
        <li>Uninstall and reinstall the app from the Shopify App Store</li>
        <li>If the issue persists, contact support with your store URL</li>
    </ul>

    <h2>Billing</h2>
    <p>Billing is handled entirely by Shopify — charges appear on your Shopify invoice. To cancel, simply uninstall the app from your Shopify admin. You will not be charged after uninstallation.</p>

    <h2>Still Need Help?</h2>
    <p>Send us an email with your store URL, a description of the issue, and any screenshots or error messages.</p>
    <p><strong>📧 <a href="mailto:support@checkoutflow.app">support@checkoutflow.app</a></strong></p>
</body>
</html>