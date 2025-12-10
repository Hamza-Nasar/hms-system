# Admin Role Setup Guide

## Important: Admin ka alag login nahi hai!

Sab users same login page use karte hain (`/login`). Admin access **role-based** hai - agar aapka user role database mein `"admin"` set hai, to aapko admin panel access milega.

## Admin Role Kaise Set Karein

### Method 1: MongoDB Shell (Recommended)

1. MongoDB shell open karein:
   ```bash
   mongosh
   ```

2. Database select karein:
   ```javascript
   use hms-system
   ```

3. Apne user ko find karein:
   ```javascript
   db.User.findOne({ email: "your-email@example.com" })
   ```

4. Role update karein:
   ```javascript
   db.User.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

5. Verify karein:
   ```javascript
   db.User.findOne({ email: "your-email@example.com" }, { role: 1, email: 1 })
   ```

### Method 2: MongoDB Compass / Studio 3T

1. MongoDB Compass open karein
2. `hms-system` database select karein
3. `User` collection open karein
4. Apne user ko find karein (email se search karein)
5. `role` field ko `"admin"` set karein
6. Save karein

### Method 3: Node.js Script (Quick Setup)

Agar aap chahte ho, main ek quick script bana sakta hoon jo automatically admin role set kar de.

## Important Notes

1. **Logout/Login Required**: Role update ke baad **logout** karein aur phir **login** karein
2. **Case Sensitive**: Role exactly `"admin"` hona chahiye (lowercase)
3. **Session Refresh**: Browser cache clear kar sakte ho agar issue aaye

## Admin Panel Access

Jab aapka role `"admin"` set ho jaye:
- Sidebar mein "Admin Panel" menu item dikhega
- Direct URL: `http://localhost:3000/dashboard/admin`
- Sabhi admin APIs kaam karenge

## Troubleshooting

### 403 Forbidden Error?
- Check karein ki aapka role `"admin"` hai
- Logout/Login karein
- Browser console mein session check karein

### Admin Panel Sidebar Mein Nahi Dikha?
- Role check karein: `db.User.findOne({ email: "your-email" }, { role: 1 })`
- Agar role `"PATIENT"` ya kuch aur hai, to `"admin"` set karein









