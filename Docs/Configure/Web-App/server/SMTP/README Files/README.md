# SMTP Server Configuration (Windows)

1. clone the repositoy:

    ```git
    git clone https://github.com/Jyotibrat/DesEM.git
    ```

2. Open the File Explorer.
3. Go to the clone repository folder titled as `DesEM`.
4. Right Click on it and click on `open with code`.
5. The folder will open in `VS Code`.
6. Open the terminal in VS Code by click on **Ctrl + `** or click on *Terminal* in the navbar and then click on *New Terminal*.
7. Paste this command to go to `server` directory:

    ```powershell
    cd apps/web-app/server
    ```

8. Now, run the `npm` command:

    ```npm
    npm install
    ```

9. If there exists any issues installing the `node modules` then, run this command:

    ```npm
    npm audit fix --force
    ```

10. Now, in the field `SMTP_USER` and `SMTP_USER` fill the email ID from which we are going to send emails for SMTP.
11. To generate the App password follow these steps:

- Enable 2-Step Verification for the google account.
- After enabling 2-step verification  go to https://myaccount.google.com/apppasswords.
- Under Select app, choose `Mail`.
- Under Select device, choose `Windows Computer`.
- Click Generate.
- Copy the Generated Password.

12. Go back to the project and then to .env file.
13. Paste the copied generated password in the `SMTP_PASS` field.

---

# For more details refer to these docs

[**IMAP, POP, and SMTP | Gmail**](https://developers.google.com/workspace/gmail/imap/imap-smtp)
[**How to Use the Gmail SMTP Server to Send Emails For Free**](https://www.geeksforgeeks.org/techtips/how-to-use-the-gmail-smtp-server-to-send-emails-for-free/)

---