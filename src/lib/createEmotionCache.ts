import createCache from "@emotion/cache";

// On the client side, create a singleton instance
let clientSideCache: ReturnType<typeof createCache> | null = null;

export default function createEmotionCache() {
  if (typeof window === "undefined") {
    // Server-side: always create a new cache
    return createCache({ 
      key: "css", 
      prepend: true
    });
  }
  
  // Client-side: reuse the same cache instance
  if (!clientSideCache) {
    clientSideCache = createCache({ 
      key: "css", 
      prepend: true
    });
  }
  
  return clientSideCache;
}
