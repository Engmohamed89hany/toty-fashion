# Backend deployment

## Vercel project settings

- Set the project root directory to `backend`.
- Use Node.js 24.x. Vercel detects the Express app from `index.js`.
- Use `npm run build` as the build command; leave the output directory unset.
- Deploy the project, then check `/api/health`. It should return HTTP 200 and
  report `"database": "connected"`.

## Production environment variables

Configure these in Vercel for Production. Do not commit them or add them to
source files.

- `DATABASE_URL`: the MySQL connection URL, including the database name.
- `DATABASE_SSL`: set to `REQUIRED` when the database requires TLS.
- `DATABASE_SSL_CA`: optional CA certificate path or PEM contents; the bundled
  Aiven CA is used if TLS is enabled and this value is omitted.
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`: separate, newly generated
  secrets. Rotate any credentials that have been exposed.
- `CORS_ORIGINS`: comma-separated frontend origins, for example
  `https://your-store.vercel.app`.
- `DATABASE_CONNECTION_LIMIT`: optional pool limit per function instance;
  defaults to `2`.

Apply the SQL files in `migrations` to the production database, in filename
order, before using product reviews, user images, and the product catalog.

## File uploads

Vercel cannot persist files written to the backend's local `images` directory.
Configure `CLOUDINARY_URL` in the backend Vercel project's Production and
Preview environments to enable persistent image uploads. The value is available
from the Cloudinary console and must be kept secret. The existing `cloudinary`
dependency is used automatically when this variable is present.

Without Cloudinary configuration, uploads on Vercel return HTTP 503 with a
configuration message instead of failing with an opaque HTTP 500. Local
development continues to use the `images` directory when Cloudinary is not
configured.
