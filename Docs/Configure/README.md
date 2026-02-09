# Configuration Guide

This folder contains configuration instructions for the *`DesEM (Drupal Custom Module)`* Project. Below is the directory structure and what each folder contains:

## Directory Structure

```
Configure/
├── README.md                          
├── Order_of_Configuration.md             
├── Drupal/
│   ├── README Files/
│   │   └── README.md             
│   └── Text Files/
│       └── Drupal_Config.txt            
├── MySQL/
│   ├── With XAMPP/
│   │   ├── README Files/
│   │   │   └── README.md    
│   │   └── Text Files/
│   │       └── MySQL_Config_with_XAMPP.txt    format
│   └── Without XAMPP/
│       ├── README Files/
│       │   └── README.md 
│       └── Text Files/
│           └── MySQL_Config_without_XAMPP.txt 
├── XAMPP/
│   ├── README Files/
│   │   └── README.md              
│   └── Text Files/
│       └── XAMPP_Config.txt             
└── Web-App/
    ├── client/
    │   └── Supabase/
    │       ├── README Files/
    │       │   └── README.md
    │       └── Text Files/
    │           └── Supabase_Integration_Client_Side.txt
    └── server/
        ├── MongoDB/
        │   ├── README Files/
        │   │   └── README.md
        │   └── Text Files/
        │       └── MongoDB_Compass_Configuration_Guide.txt
        ├── SMTP/
        │   ├── README Files/
        │   │   └── README.md
        │   └── Text Files/
        │       └── SMTP_Server_Configuration.txt
        └── Supabase/
            ├── README Files/
            │   └── README.md
            └── Text Files/
                └── Supabase_Integration_Server_Side.txt
```

## Folder Contents

### Order_of_Configuration.md
Contains the recommended order in which to configure the different components of the *`DesEM (Drupal Custom Module)`* Project.

### Drupal/
Contains configuration instructions for setting up and configuring *`Drupal`*.
- **README Files/**: *`Drupal`* configuration guide in Markdown format.
- **Text Files/**: *`Drupal`* configuration guide in plain text format.

### MySQL/
Contains *`MySQL`* configuration instructions with two variants:
- **With XAMPP/**: Instructions for configuring *`MySQL`* that comes *`bundled with XAMPP`*.
- **Without XAMPP/**: Instructions for configuring a *`standalone MySQL`* installation.

Each variant includes both *`Markdown`* and *`text`* format versions.

### XAMPP/
Contains configuration instructions for setting up and configuring *`XAMPP`*, which includes the Apache web server and MySQL database.
- **README Files/**: *`XAMPP`* configuration guide in Markdown format.
- **Text Files/**: *`XAMPP`* configuration guide in plain text format.

### Web-App/
Contains configuration instructions for setting up and configuring the *`Web-App`* in local machine.
- **client/**: It contains the configuration of `Supabase` on the `client` side.
- **server/**: It contains the configuration of `Supabase`, `SMTP` and `MongoDB Compass` on the `server` side.