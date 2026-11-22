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

Uploads are stored directly in the backend's `images` directory during local
development. On Vercel, uploads use `/tmp/toty-fashion/images`, since the
deployed application directory is read-only. The `/images` route serves files
from the same directory.

Vercel `/tmp` storage is temporary and instance-local: files can disappear when
the function instance is recycled and may not be available to another instance.
This option requires no external image-storage credentials, but is not suitable
for images that must persist.
