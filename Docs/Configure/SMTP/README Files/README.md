# Configure Send Mail Transfer Protocol for sending mails after event registration (Windows)

1. In the `XAMPP` directory inside the `C:` Drive, there is another directory titled as `sendmail`.
2. In the `sendmail` directory, there will be a file titled as `sendmail.ini`.
3. Open the file in a `text editor`.
4. Then, edit these settings in the file:
    - **smtp_server**=smtp.gmail.com (If you want to use `Google SMTP` server)
    - **smtp_port**=587
    - **smtp_ssl**=tls
    - **auth_username**=your-email@gmail.com
    - **auth_password**=your-16-char-app-password
    - **force_sender**=your-email@gmail.com
5. Save the File.
6. Now, inside the `XAMPP` directory there will be another folder titled as `php`.
7. Inside the `php` folder, there will be a `php.ini` file.
8. Open the `php.ini` file inside a `text editor`.
9. Then edit these settings in the file:
    - **SMTP**=smtp.gmail.com
    - **smtp_port**=587
    - **sendmail_from**=your-email@gmail.com
    - **sendmail_path**="\"C:\xampp\sendmail\sendmail.exe\" -t"
10. Save the file.
11. Now, when any user will register for any event then, he will be notified using the mail we have entered.

---