# Greysquirrel

Main languages used:

- React
- Typescript
- CSS (Tailwind)
- Nodejs
- MySql

Designs by [Joneil Escobar](https://www.joneilescobar.com)

## A lightweight live text-editing environment

### Main Features

- User Registration

First timers are greeted and directed toward the registration page where they are promted to create a user. Upon submitting the form, Greysquirrel will send an email with a link to verify the user's email address. At the moment, user emails are only used for the "forgot password" feature. User passwords are stored securely, using salt and hashing.

- Security

Greysquirrel ensures user security by using JSON web tokens stored in HTTP only cookies. User data cannot be accessed unless JWTs are present.

- Document creation

Users can create and edit documents in Greysquirrel's lightweight, custom text editor (created using QuillJS). The editor is equipped with an autosave feature.

- Shared documents

  - Once a document has been created, users can share access with friends and colleagues. At the moment, invites can only be sent within the app by passing in a username.

  - Authorized users have permission to edit shared documents, but cannot delete them. The document's owner can revoke access to shared users at any time. Users may also remove themselves from the authorized users list.

- Live editing

By taking advantage of websockets, Greysquirrel grants users the ability to use live editing. This allows multiple users to access and edit a single document simultaneously.

- Account management

Users can change info such as name, username, password, and email at any time.
