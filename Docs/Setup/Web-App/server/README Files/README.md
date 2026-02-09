# Web-App Server Setup (Windows)

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

10. Now, star the `node` Server:

    ```npm
    node server.js
    ```

11. Go to **http://localhost:5000/api** to access the backend.

# Refer to these docs for node and npm

- [**Downloading and Installing Node.js and npm**](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/)
- [**npm Docs**](https://docs.npmjs.com/)
- [**NPM Docs Command**](https://www.geeksforgeeks.org/node-js/npm-docs-command/)