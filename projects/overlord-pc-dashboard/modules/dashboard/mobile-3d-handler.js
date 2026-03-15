/**
 * Mobile 3D Scene Handler
 * Handles device orientation changes, resize events, and touch interactions
 * for 3D scenes with Stale-While-Revalidate data fetching support
 */

class Mobile3DHandler {
  constructor(canvas, renderer, camera, scene) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
    
    // State
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.isLandscape = window.innerWidth > window.innerHeight;
    this.lastOrientation = screen.orientation ? screen.orientation.type : (this.isLandscape ? 'landscape' : 'portrait');
    
    // Touch handling
    this.touchState = {
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      isDragging: false,
      pinchStartDist: 0,
      pinchStartScale: 1
    };
    
    // SWR Cache for 3D assets/data
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    
    this.init();
  }
  
  init() {
    this.setupOrientationHandling();
    this.setupResizeHandling();
    this.setupTouchHandling();
    this.setupVisibilityHandling();
    
    // Initial resize
    this.handleResize();
    
    console.log('[Mobile3D] Handler initialized. Mobile:', this.isMobile);
  }
  
  /**
   * Handle device orientation changes
   */
  setupOrientationHandling() {
    // Screen Orientation API (modern browsers)
    if (screen.orientation) {
      screen.orientation.addEventListener('change', (e) => {
        this.handleOrientationChange(e);
      });
    }
    
    // Fallback for older browsers
    window.addEventListener('orientationchange', () => {
      // Delay to allow browser to complete rotation
      setTimeout(() => this.handleResize(), 300);
    });
    
    // Device tilt for holographic mode (optional)
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        this.handleDeviceTilt(e);
      }, { passive: true });
    }
  }
  
  handleOrientationChange(event) {
    const newOrientation = screen.orientation.type;
    console.log('[Mobile3D] Orientation changed:', this.lastOrientation, '->', newOrientation);
    
    // Update layout based on orientation
    this.isLandscape = newOrientation.includes('landscape');
    
    // Trigger resize after orientation change
    setTimeout(() => this.handleResize(), 300);
    
    // Update scene layout if needed
    if (this.isLandscape) {
      document.documentElement.setAttribute('data-layout', 'holographic');
    } else {
      document.documentElement.setAttribute('data-layout', 'normal');
    }
    
    this.lastOrientation = newOrientation;
  }
  
  /**
   * Handle window resize
   */
  setupResizeHandling() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
      // Debounce resize events
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.handleResize(), 100);
    });
    
    // Handle visual viewport changes (mobile keyboard, etc)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        this.handleVisualViewportChange();
      });
    }
  }
  
  handleResize() {
    if (!this.canvas || !this.camera || !this.renderer) return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Update camera aspect ratio
    if (this.camera.aspect) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
    
    // Update renderer size
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Update canvas display size
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    
    console.log('[Mobile3D] Resized to:', width, 'x', height);
    
    // Dispatch custom event for scene updates
    window.dispatchEvent(new CustomEvent('scene-resized', {
      detail: { width, height, isLandscape: this.isLandscape, isMobile: this.isMobile }
    }));
  }
  
  handleVisualViewportChange() {
    if (!window.visualViewport) return;
    
    // Adjust for mobile keyboards, URL bars, etc.
    const vv = window.visualViewport;
    this.canvas.style.transform = `translate(${vv.offsetLeft}px, ${vv.offsetTop}px)`;
  }
  
  handleDeviceTilt(event) {
    // Beta: front-to-back (-180 to 180)
    // Gamma: left-to-right (-90 to 90)
    const beta = event.beta || 0;
    const gamma = event.gamma || 0;
    
    // Trigger holographic mode on significant tilt
    if (Math.abs(beta) > 30 || Math.abs(gamma) > 30) {
      document.documentElement.setAttribute('data-tilt', 'active');
    } else {
      document.documentElement.removeAttribute('data-tilt');
    }
  }
  
  /**
   * Touch handling for 3D interaction
   */
  setupTouchHandling() {
    if (!this.canvas) return;
    
    // Prevent default touch behaviors
    this.canvas.style.touchAction = 'none';
    
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    
    // Pointer events for unified handling
    this.canvas.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    this.canvas.addEventListener('pointermove', (e) => this.handlePointerMove(e));
    this.canvas.addEventListener('pointerup', (e) => this.handlePointerUp(e));
    this.canvas.addEventListener('pointercancel', (e) => this.handlePointerUp(e));
  }
  
  handleTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    
    this.touchState.startX = touch.clientX;
    this.touchState.startY = touch.clientY;
    this.touchState.lastX = touch.clientX;
    this.touchState.lastY = touch.clientY;
    this.touchState.isDragging = true;
    
    // Handle pinch gesture
    if (event.touches.length === 2) {
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      this.touchState.pinchStartDist = Math.sqrt(dx * dx + dy * dy);
      this.touchState.pinchStartScale = this.camera.zoom || 1;
    }
  }
  
  handleTouchMove(event) {
    event.preventDefault();
    if (!this.touchState.isDragging) return;
    
    if (event.touches.length === 1) {
      // Single touch - rotate/pan
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.touchState.lastX;
      const deltaY = touch.clientY - this.touchState.lastY;
      
      this.touchState.lastX = touch.clientX;
      this.touchState.lastY = touch.clientY;
      
      // Dispatch custom event for scene to handle
      window.dispatchEvent(new CustomEvent('scene-touch-move', {
        detail: { deltaX, deltaY, touch }
      }));
      
    } else if (event.touches.length === 2) {
      // Pinch gesture - zoom
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const scale = dist / this.touchState.pinchStartDist;
      
      window.dispatchEvent(new CustomEvent('scene-pinch', {
        detail: { scale, distance: dist }
      }));
    }
  }
  
  handleTouchEnd(event) {
    event.preventDefault();
    
    if (event.changedTouches.length > 0) {
      const touch = event.changedTouches[0];
      const diffX = this.touchState.startX - touch.clientX;
      const diffY = this.touchState.startY - touch.clientY;
      const diff = Math.sqrt(diffX * diffX + diffY * diffY);
      
      // Swipe detection
      if (diff > 50) {
        window.dispatchEvent(new CustomEvent('scene-swipe', {
          detail: {
            direction: Math.abs(diffX) > Math.abs(diffY) 
              ? (diffX > 0 ? 'left' : 'right')
              : (diffY > 0 ? 'up' : 'down'),
            diffX,
            diffY
          }
        }));
      }
    }
    
    this.touchState.isDragging = false;
  }
  
  handlePointerDown(event) {
    if (event.pointerType === 'touch') {
      this.canvas.setPointerCapture(event.pointerId);
    }
  }
  
  handlePointerMove(event) {
    // Additional pointer handling if needed
  }
  
  handlePointerUp(event) {
    if (event.pointerType === 'touch') {
      this.canvas.releasePointerCapture(event.pointerId);
    }
  }
  
  /**
   * Page Visibility API - pause/resume rendering
   */
  setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseRendering();
      } else {
        this.resumeRendering();
      }
    });
  }
  
  pauseRendering() {
    window.dispatchEvent(new CustomEvent('scene-pause'));
    console.log('[Mobile3D] Rendering paused');
  }
  
  resumeRendering() {
    window.dispatchEvent(new CustomEvent('scene-resume'));
    this.handleResize(); // Refresh size on resume
    console.log('[Mobile3D] Rendering resumed');
  }
  
  /**
   * Stale-While-Revalidate data fetching
   * Returns cached data immediately while fetching fresh data in background
   */
  async fetchWithSWR(key, fetcher, options = {}) {
    const {
      maxAge = 60000,        // Cache max age in ms (1 minute default)
      staleWhileRevalidate = 300000  // Use stale data while revalidating (5 minutes)
    } = options;
    
    const now = Date.now();
    const cached = this.cache.get(key);
    const timestamp = this.cacheTimestamps.get(key);
    
    const isFresh = cached && timestamp && (now - timestamp) < maxAge;
    const isStale = cached && timestamp && (now - timestamp) < (maxAge + staleWhileRevalidate);
    
    // Return fresh cache immediately
    if (isFresh) {
      return { data: cached, fromCache: true, stale: false };
    }
    
    // Return stale cache while revalidating
    if (isStale) {
      // Trigger background refresh
      this.revalidate(key, fetcher);
      return { data: cached, fromCache: true, stale: true };
    }
    
    // No cache, fetch fresh
    try {
      const data = await fetcher();
      this.cache.set(key, data);
      this.cacheTimestamps.set(key, now);
      return { data, fromCache: false, stale: false };
    } catch (error) {
      // If fetch fails and we have expired cache, return it as fallback
      if (cached) {
        return { data: cached, fromCache: true, stale: true, error };
      }
      throw error;
    }
  }
  
  async revalidate(key, fetcher) {
    try {
      const data = await fetcher();
      this.cache.set(key, data);
      this.cacheTimestamps.set(key, Date.now());
      
      // Dispatch event to notify of new data
      window.dispatchEvent(new CustomEvent('swr-updated', {
        detail: { key, data }
      }));
    } catch (error) {
      console.warn('[Mobile3D] SWR revalidation failed:', error);
    }
  }
  
  clearCache(key) {
    if (key) {
      this.cache.delete(key);
      this.cacheTimestamps.delete(key);
    } else {
      this.cache.clear();
      this.cacheTimestamps.clear();
    }
  }
  
  /**
   * Cleanup
   */
  destroy() {
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
    
    if (screen.orientation) {
      screen.orientation.removeEventListener('change', this.handleOrientationChange);
    }
    
    this.clearCache();
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Mobile3DHandler;
}
