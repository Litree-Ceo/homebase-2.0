# LITLABS Research Notes (2026)

## Key Points
- Windows 11 in 2026 provides built-in and third-party tools for user choices (Start menu, PowerToys), but some defaults can reset after updates.
- Paddle subscriptions via Azure Functions are straightforward; keep pricing user-friendly to minimize churn.
- A hybrid payment system (Paddle + CoinGate/BitPay) accepts reasonable methods with low fees (1-3%); security/compliance is essential.
- Social logins via Azure AD B2C are supported, but new customers must use Entra External ID (B2C end-of-sale in 2025).
- Google Cloud supports NFT analytics (BigQuery) and Web3 programs but does not host personal NFTs by default.

## Enhancing User Choices in Windows 11
Windows 11 supports personalization through Start menu folders, lock screen tweaks, and Settings > Personalization. PowerToys adds Run, Peek, and Keyboard Manager. Some defaults reset after updates; registry edits or trusted tools can help persistence.

PowerShell snippet:
```powershell
# customize-win11.ps1
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" -Name "Start_ShowRecommended" -Value 0
Write-Host "Recommended section removed. Install PowerToys for more options."
```

| Customization Feature | Built-in Method | Third-Party Enhancement | Benefits |
|---|---|---|---|
| Start Menu Layout | Drag folders, Settings > Personalization | Power Start Menu | Personalized pins |
| Default Apps | Settings > Apps > Default apps | Registry edits/PowerToys | More stable defaults |
| Context Menus | Registry edits | Windhawk/Fluent apps | Quick access |
| Advanced UI | Taskbar options | PowerToys Peek/Run | Faster workflows |

## Subscription and Payment Setup
Paddle integrates well with Azure Functions for recurring revenue. Webhooks handle fulfillment, and APIM can support API monetization. Store subscription state in Cosmos DB and secrets in Key Vault.

Example (hosted checkout link):
```typescript
const checkoutUrl = process.env.NEXT_PUBLIC_PADDLE_CHECKOUT_URL_STARTER;
window.location.href = checkoutUrl;
```

| Tier | Features | Pricing | Notes |
|---|---|---|---|
| Free | Basic access | $0 | Onboarding |
| Basic | Core features | $9.99 | Paddle fixed-price |
| Pro | Advanced/NFT | $29.99 | Usage-based |
| Enterprise | Custom | Custom | Webhook automation |

## Smart Payment System
Use Paddle for cards/wallets and a crypto gateway (CoinGate or BitPay) for flexible payment options. Keep fee visibility and compliance in mind.

| Gateway | Methods | Fees | Notes |
|---|---|---|---|
| Paddle | Cards, wallets | 2.9% + 30c | Easy Azure integration |
| CoinGate | 300+ cryptos | 0.5-1% | Wide crypto support |
| BitPay | BTC, stablecoins | ~1% | Business-focused |

## Social Logins
Azure AD B2C supports Google/Facebook/GitHub sign-ins, but new customers should use Entra External ID post-2025. React libraries like `@react-oauth/google` and `react-facebook-login` work well with Azure backends.

| Provider | Method | Notes |
|---|---|---|
| Google | @react-oauth/google | Email/profile sharing |
| Facebook | react-facebook-login | GDPR compliance |
| GitHub | OAuth via B2C/Entra | Scoped access |

## Google Cloud NFTs
Google Cloud supports NFT analytics via BigQuery and offers a Web3 program. It does not host personal NFTs unless assets are stored in Cloud Storage. Use blockchain explorers or the Google Cloud console to verify.

| Feature | Description | NFT Relevance |
|---|---|---|
| BigQuery Blockchain | Analytics on 11+ chains | Query NFT data |
| Web3 Program | Credits/labs | Build NFT apps |
| GCUL Blockchain | Permissioned L1 | Payments focus |
| Cloud Storage | Asset hosting | Store NFT files |

## Key Citations
- Windows 11 customization: https://www.youtube.com/watch?v=JvXVzloYc1k
- Windows 11 tips: https://www.pcmag.com/explainers/youre-using-windows-11-wrong-until-you-learn-these-31-game-changing-tricks
- Windows personalization: https://learn.microsoft.com/en-us/answers/questions/3884496/how-can-i-set-personalization-in-windows-11-so-tha
- PowerToys overview: https://www.techradar.com/computing/windows/im-transforming-windows-11-in-2026-using-powertoys-heres-how-you-can-too
- Paddle docs: https://developer.paddle.com
- Paddle pricing: https://paddle.com
- 
- Crypto gateways: https://coingate.com/
- Crypto payments guide: https://0xprocessing.com/blog/the-ultimate-guide-top-5-crypto-payment-gateways-of-2026-for-business/
- Azure AD B2C FAQ: https://learn.microsoft.com/en-us/azure/active-directory-b2c/faq
- B2C end-of-sale: https://www.schneider.im/microsoft-azure-ad-b2c-end-of-sale-to-new-customers/
- Google Cloud Web3: https://nftplazas.com/google-cloud-web3/
- Google Cloud blockchain analytics: https://blockworks.co/news/google-cloud-additional-blockchain-support-bit-query

