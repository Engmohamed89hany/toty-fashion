
# Frontend

## Backend API

Set `NEXT_PUBLIC_API_URL` to the backend API base URL, including `/api`.

- Local development defaults to `http://localhost:4000/api`.
- Production defaults to `https://toty-fashion-irgg.vercel.app/api`.

The production frontend's Vercel project should have `NEXT_PUBLIC_API_URL`
configured for Production and Preview. Because this value is public and embedded
at build time, redeploy the frontend after changing it.
