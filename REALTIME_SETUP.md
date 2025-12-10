# Real-Time Features Setup Guide

## ⚠️ Important: Real-Time Features Requirement

Real-time features (live updates, notifications, chat) require the **custom server** to be running. The standard Next.js dev server does NOT support Socket.io.

## Quick Start

### For Development with Real-Time Features:

```bash
npm run dev:server
```

### For Standard Development (without real-time):

```bash
npm run dev
```

## How to Enable Real-Time Features

1. **Stop your current server** (if running):
   - Press `Ctrl+C` in the terminal

2. **Start the custom server**:
   ```bash
   npm run dev:server
   ```

3. **Look for these messages** in the console:
   ```
   > Ready on http://localhost:3000
   > Socket.io server initialized
   > WebSocket endpoint: ws://localhost:3000/api/socket
   ```

4. **Refresh your browser** - you should see:
   - "Live" indicator on pages with real-time features
   - Real-time updates working
   - Socket connection established

## Verification

### Check Connection Status:

1. Open browser console (F12)
2. Look for: `✅ Real-time features connected successfully!`
3. On pages with real-time features, you should see a green "Live" chip

### If Not Connected:

You'll see a warning in console:
```
⚠️ Real-time features not available. To enable real-time:
   1. Stop current server (Ctrl+C)
   2. Run: npm run dev:server
   3. Refresh the page
```

## Real-Time Features Include:

- ✅ Live appointment updates
- ✅ Real-time notifications
- ✅ Doctor schedule updates
- ✅ Prescription updates
- ✅ Lab test updates
- ✅ Billing updates
- ✅ Live chat (if implemented)
- ✅ Dashboard statistics updates

## Troubleshooting

### Issue: "Live" indicator not showing

**Solution**: Make sure you're running `npm run dev:server` not `npm run dev`

### Issue: Connection errors in console

**Solution**: 
1. Check if custom server is running
2. Verify port 3000 is not blocked
3. Check firewall settings

### Issue: Real-time updates not working

**Solution**:
1. Verify Socket.io is initialized (check server console)
2. Check browser console for connection errors
3. Ensure you're authenticated (logged in)
4. Refresh the page after starting custom server

## Production Deployment

For production, use:
```bash
npm run build
npm run start:server
```

This will start the production server with Socket.io support.

## Notes

- Real-time features are **optional** - the app works without them
- Without real-time, you'll need to refresh pages to see updates
- Custom server is required for full functionality
- Standard `npm run dev` works for development but without real-time features



