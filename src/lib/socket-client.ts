// Client-side Socket.io initialization
// This will be used by the useSocket hook

export const getSocketUrl = () => {
  if (typeof window === 'undefined') return '';
  
  // In development, use the same origin
  // In production, you might want to use a separate Socket.io server
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  
  // For Next.js, we'll use the API route
  return `${protocol}//${host}`;
};




