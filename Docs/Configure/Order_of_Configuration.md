# Order of Configuration

The configuration should be done in the following order:

1. **XAMPP Configuration** (First)
   - Configure *`XAMPP`* first as it provides the web server and local development environment.

2. **Drupal Configuration** (Second)
   - Configure *`Drupal`* after *`XAMPP`* is set up.

3. **MySQL Configuration** (Third - Optional)
   - *`MySQL`* configuration is optional because *`XAMPP`* already includes *`MySQL`*.
   - You can use the *`MySQL`* server that comes bundled with *`XAMPP`*.
   - There is no need to install or configure a separate *`MySQL`* installation if you are using *`XAMPP`*.

4. **SMTP Configuration** (Fourth)
   - Read the docs to configure `SMTP` Server to send mails to users after registering for an event.

5. **Web-App Configuration** (Fifth - Optional)
   - *`Web-App`* configuration is optional because it is not the main part of the FOSSEE Task.
   - You can still read the documentation for the Web-App and run it in your local machine.
   - It is basically a minimalistic simulation of Drupal CMS as a Web-App Version.

## Summary

Follow this sequence: ***`XAMPP`* → *`Drupal`* → *`MySQL`* (Optional) → *`SMTP`***

Since *`XAMPP`* comes with *`MySQL`*, you have the choice to use the bundled *`MySQL`* database without needing a separate installation.