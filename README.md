# CyberTech (Aamir) — MongoDB version

The admin panel now reads and writes products through a server API backed by MongoDB Atlas. The MongoDB URI and admin credentials are kept in environment variables and are **not** placed in the public HTML.

## Setup

1. In MongoDB Atlas, open **Network Access** and allow the server's IP address. For local testing, add your current IP address. Avoid `0.0.0.0/0` for a production database unless you understand the exposure.
2. In Atlas **Database Access**, ensure your database user has read/write access to the `cybertech` database.
3. Copy `.env.example` to `.env`.
4. Edit `.env`:
   - `MONGODB_URI`: use your Atlas URI and replace the password placeholder. URL-encode special characters in the password.
   - `ADMIN_USERNAME` and `ADMIN_PASSWORD`: set the login credentials for the website admin panel. Do not reuse the MongoDB password.
   - `SESSION_SECRET`: generate a long random secret.
5. Install dependencies and run:
   ```bash
   npm install
   npm start
   ```
6. Open `http://localhost:3000`. The first run inserts the 12 starter products if the `products` collection is empty.

## Deploying

Deploy this project to a Node.js host (for example, Render or Railway). Set the same environment variables in the host's dashboard. Do **not** upload `.env` or commit it to Git. The host must run `npm start`; a static-only host such as GitHub Pages cannot run this API.

## Data behavior

- Public pages read published products from `GET /api/products`.
- Admin login is checked on the server and uses an HTTP-only session cookie stored in MongoDB.
- Admin data is read from `GET /api/admin/products`.
- Product changes are saved to MongoDB using `PUT /api/admin/products/bulk`.
- Product images currently remain data URLs stored in MongoDB, with a 1.5 MB upload limit in the UI. For a large catalog, move images to an image/file host and store URLs instead.

## Important security notes

- A MongoDB connection string must never be put in `index.html`, browser JavaScript, or a public repository.
- The MongoDB password was shared in chat; rotate it in Atlas before deploying, then update `MONGODB_URI` in your environment variables.
- Use HTTPS in production. The session cookie is configured as secure when `NODE_ENV=production`.
- Do not use the example admin password. Set your own strong, unique admin password.
