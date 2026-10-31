# Demo catalog

From the `backend` directory, run:

```powershell
npm run seed:demo
```

The command inserts four sample categories and eight products into the MySQL
database configured in `config/ConnectDB.js`. It is safe to rerun: existing
demo categories, products, and product images are left in place. Product and
category photos use Unsplash URLs, so the browser needs internet access to
display them.
