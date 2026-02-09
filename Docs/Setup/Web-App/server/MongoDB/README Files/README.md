# MongoDB Compass Installation Guide (Windows)

## 1. Download MongoDB Compass

1. Open your browser and go to:
   https://www.mongodb.com/try/download/compass
2. Select:
   - Platform: Windows
   - Package: MSI
3. Click **Download**.

---

## 2. Install MongoDB Compass

1. Locate the downloaded `.msi` file.
2. Double-click the file to start the installation.
3. Click **Next**.
4. Accept the license agreement.
5. Choose the installation type:
   - Complete (Recommended)
6. Click **Install**.
7. Click **Finish** after installation is complete.

MongoDB Compass will now be available from the Start Menu.

---

## 3. Start MongoDB Compass

1. Open the Start Menu.
2. Search for **MongoDB Compass**.
3. Click to launch the application.

---

## 4. Connect to Local MongoDB Server

Ensure MongoDB Server is installed and running on your system.

Default local connection string:

```
mongodb://localhost:27017
```

Steps:

1. Open MongoDB Compass.
2. Paste the connection string into the connection field.
3. Click **Connect**.

If successful, the local databases will appear.

---

## 5. Create a New Database

1. Click **Create Database**.
2. Enter:
   - Database Name (Example: contentflow)
   - Collection Name (Example: users)
3. Click **Create Database**.

---