# System Overlord - Phase 0: Quick Reference

## 📊 Files & Locations

```
System-Overlord-Phase0/
├── web/package.json              ← Next.js dependencies
├── web/tailwind.config.ts        ← UI theming (cyberpunk)
├── functions/src/index.ts        ← Cloud Functions (WebRTC, GG.deals, etc)
├── bots/gg_deals_monitor.py      ← Price monitor bot
├── bots/main.py                  ← Bot orchestrator
├── firebase.json                 ← Firebase project config
├── firestore.rules               ← Security rules
└── README.md (THIS)
```

## 🚀 Fast Track Commands

```bash
# Initial setup (run once)
firebase init hosting functions firestore

# Deploy web app
cd web && npm install && npm run build && firebase deploy --only hosting

# Deploy Cloud Functions
cd functions && npm install && firebase deploy --only functions

# Run bots (on Android/Termux)
cd bots && pip install -r requirements.txt && python3 main.py
```

## 📈 Revenue Sources (Immediate)

| Source | Setup Time | Latency | Revenue Potential |
|--------|-----------|---------|-------------------|
| GG.deals Affiliate | 30 min | Real-time | $1-5/click |
| AdMob Display Ads | 1 hour | 2-4h | $0.50-2.00 eCPM |
| Real-Debrid Referral | 1 hour | Monthly | 10-30% MRR |
| Premium Subscription | 2 hours | Immediate | $3-29/user/mo |

**Expected Week 1:** $5-50  
**Expected Month 1:** $100-500+

## 🔧 Key Environment Variables

Create `.env` in project root:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=xxx
GG_DEALS_AFFILIATE_ID=your-id
ADMOB_PUBLISHER_ID=pub-xxx
STRIPE_SECRET_KEY=sk_xxx
REAL_DEBRID_API_KEY=xxx
NOTIFICATION_INTERVAL=300
```

## ✅ Success Metrics

After deploying:

1. **Web App Live** - Site loads at `https://your-project.web.app`
2. **Cloud Functions Working** - No errors in `firebase functions:log`
3. **Firestore Data Flowing** - New documents in `deals` collection
4. **First Revenue Event** - Entry in `revenue` collection
5. **Bot Operational** - Logs in `bot_logs` collection

## 🎯 Phase 0 → Phase 1 Progression

| Phase | Timeline | Key Milestones | Cost |
|-------|----------|-----------------|------|
| Phase 0 | Day 0-7 | Foundation live, bot running, first revenue | $0 |
| Phase 1 | Week 2-4 | Custom domain, better connectivity, $100+ revenue | $3-15 |
| Phase 2 | Month 2+ | Premium features, scale to 1K+ users | $50+ |
| Phase 3 | Month 3+ | Kubernetes, global scale, self-funding | Variable |

## 🆘 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| Firebase auth failing | `firebase login && firebase init` |
| Cloud Functions won't deploy | Check Node version (`node -v`), must be 18+ |
| Bots can't reach Firebase | Export credentials in `.env` |
| GG.deals returning 403 | Verify affiliate ID, check rate limits |
| Web app showing blank page | Check `firebase functions:log` for errors |

## 📞 Support Resources

- Firebase Docs: https://firebase.google.com/docs
- GG.deals API: https://www.gg.deals/developers/
- Real-Debrid API: https://api.real-debrid.com/
- Next.js Docs: https://nextjs.org/docs

---

## ⚡ Next Step

```bash
# Go live!
firebase deploy
```

**You're now generating revenue autonomously.** 🤖💰

Follow `/docs/DEPLOYMENT.md` for step-by-step instructions.
