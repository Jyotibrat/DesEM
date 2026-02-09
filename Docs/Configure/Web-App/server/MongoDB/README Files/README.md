# MONGODB Compass Configuration Guide (Windows)

## 1. MongoDB Connection String

For local MongoDB:

```
MONGODB_URI=mongodb://localhost:27017/contentflow
```

Explanation:
- `mongodb://` → Protocol
- `localhost` → Local machine
- `27017` → Default MongoDB port
- `contentflow` → Database name

MongoDB will automatically create the database when data is inserted.

---

## 2. Create a .env File

1. Open your project root folder.
2. Create a new file named:

```
.env
```

---

## 3. Add the MongoDB URI

Inside `.env`, add:

```
MONGODB_URI=mongodb://localhost:27017/contentflow
```

Save the file.

---

## 4. Restart the Server

After editing `.env`:

```
node server.js
```