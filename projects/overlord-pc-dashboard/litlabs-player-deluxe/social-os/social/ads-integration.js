// ============================================================
// LiTreeLabStudio Ads Integration
// Google AdSense + Premium Ad Removal
// ============================================================

// Ad Configuration
const ADS_CONFIG = {
  // Replace with your actual AdSense Publisher ID
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXX',
  
  // Ad Slots
  slots: {
    sidebar: 'HOME_SIDEBAR_1',
    feedNative: 'FEED_NATIVE_1',
    videoPreroll: 'VIDEO_PREROLL_1',
    interstitial: 'INTERSTITIAL_1'
  },
  
  // Frequency capping
  maxAdsPerFeed: 3,
  feedAdInterval: 5, // Show ad every N posts
  
  // Premium bypass
  premiumNoAds: true
};

// Initialize Ads
function initAds() {
  // Check if user has premium (no ads)
  const user = getCurrentUser();
  if (user?.premium?.active && ADS_CONFIG.premiumNoAds) {
    console.log('[Ads] Premium user - ads disabled');
    return;
  }
  
  // Load AdSense script
  if (!document.getElementById('adsense-script')) {
    const script = document.createElement('script');
    script.id = 'adsense-script';
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.publisherId}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }
  
  // Initialize ad containers
  initFeedAds();
  initSidebarAd();
}

// Insert ads into feed
function initFeedAds() {
  const feed = document.getElementById('postsFeed');
  if (!feed) return;
  
  let adCount = 0;
  const posts = feed.querySelectorAll('.post');
  
  posts.forEach((post, index) => {
    if ((index + 1) % ADS_CONFIG.feedAdInterval === 0 && adCount < ADS_CONFIG.maxAdsPerFeed) {
      const adContainer = createAdContainer('feed');
      post.after(adContainer);
      adCount++;
      
      // Push to AdSense
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  });
}

// Create ad container
function createAdContainer(type) {
  const container = document.createElement('div');
  container.className = 'ad-container';
  
  const ins = document.createElement('ins');
  ins.className = 'adsbygoogle';
  ins.style.display = 'block';
  ins.setAttribute('data-ad-client', ADS_CONFIG.publisherId);
  
  switch(type) {
    case 'feed':
      ins.setAttribute('data-ad-slot', ADS_CONFIG.slots.feedNative);
      ins.setAttribute('data-ad-format', 'fluid');
      ins.setAttribute('data-ad-layout-key', '-fb+5w+4e-db+86');
      break;
    case 'sidebar':
      ins.setAttribute('data-ad-slot', ADS_CONFIG.slots.sidebar);
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
      break;
  }
  
  container.appendChild(ins);
  return container;
}

// Initialize sidebar ad
function initSidebarAd() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  
  const adContainer = createAdContainer('sidebar');
  sidebar.appendChild(adContainer);
  
  (window.adsbygoogle = window.adsbygoogle || []).push({});
}

// Premium: Remove all ads
function removeAllAds() {
  document.querySelectorAll('.ad-container').forEach(ad => ad.remove());
}

// Export for use in app
window.LitAds = {
  init: initAds,
  removeAll: removeAllAds,
  config: ADS_CONFIG
};
