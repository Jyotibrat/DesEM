# XAMPP Configuration (Windows)

1. Once the installation of *`XAMPP Web Server`* is complete then we can open *`XAMPP Control Panel`*.
2. We click the *`start`* button beside *`Apache`* to start the *`Apache Server`*.
3. We click the *`start`* button beside *`MySQL`* if we have not installed *`MySQL`* on our *`Windows`* System.
4. During *`Drupal Setup`*, in the section of *`Verify requirements`* section there might be error of *`PHP extensions`*.
5. To resolve the error, go to *`XAMPP Control Panel`* and click on *`Config`* for the *`Apache Server`*.
6. After clicking on *`Config`* a pop up menu appears in which we need to click the *`fourth option`* which is *`PHP (php.ini)`*.
7. After clicking on *`PHP (php.ini)`*, a text file will open.
8. Search *`gd`* in the text file by clicking **Ctrl + F**.
9. After searching, we get this line in the text file: **;extension=gd**.
10. Then, we remove the *`semi-colon (;)`* from the line and enter **Ctrl + S** to save the changes to the text file. We remove the *`semi-colon (;)`* because it represents a comment and by removing it we remove the comment and now the line is a part of the code.
11. After saving the file, stop the *`Apache Server`* and *`MySQL Server`* in *`XAMPP Control Panel`* and again start both of the servers.
12. Then, refresh the *`web browser`* where *`Drupal`* was being setup.
13. The error will be resolved and then, we can click on **continue anyway** at the bottom of the page to move to the next section which is *`Set up database`*.

---

# Check this YouTube Video for more details:

[**How to Install Drupal 10 on Windows 11 using xampp server | Drupal Installation | Drupal Tutorial #1**](https://youtu.be/NTNWIk3gdFY?si=D1Qm-OWiQUc5GLPI)

---