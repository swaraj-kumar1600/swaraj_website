# Developer Portfolio

Personal portfolio site built with Express, EJS, Tailwind CSS, and Mongoose —
structured the same way as the reference repo (MVC-style `routes/` →
`controllers/` → `views/`, plus `models/`, `utils/`, `public/`).

## Structure
```
app.js                     # entrypoint, view engine, static files, optional Mongo connect
routes/portfolioRouter.js  # route table
controllers/
  portfolioController.js   # page rendering + contact form + semester results logic
  errors.js                # 404 handler
models/
  message.js                # Mongoose schema for contact form submissions
  semester.js                # Mongoose schema for semester-wise results
utils/pathUtil.js          # resolves project root
views/
  partials/                # head, nav, footer includes
  portfolio/                # index, about, skills, portfolio, contact, results
  404.ejs
public/
  js/reveal.js               # scroll-reveal animation script
  uploads/marksheets/        # uploaded marksheet files (git-ignored)
  # compiled Tailwind CSS + static assets
```

## Run it

```bash
npm install
npm run build:css   # compile Tailwind once
npm run server       # start the app on http://localhost:3000
```

For live CSS rebuilds while editing, use `npm start` instead (runs nodemon + tailwind watch together).

## Database (optional)

The contact form and semester results both work without a database —
contact submissions are logged to the console, and marksheets are still
saved to disk and tracked in memory. To persist everything properly, copy
`.env.example` to `.env` and set `MONGODB_URI` to your MongoDB connection
string.

## Semester Results

Visit `/results` to view and upload semester-wise marksheets (PDF, JPG, or
PNG, up to 5MB). The upload form is owner-only — set `ADMIN_KEY` in your
`.env` and enter the same value in the form's "Admin Key" field when
uploading. Leave `ADMIN_KEY` unset locally to skip that check while testing.

**Note for hosting on free tiers (e.g. Render's free plan):** the
filesystem is ephemeral, so uploaded marksheets won't survive a redeploy or
restart. For permanent storage in production, swap the local disk storage
in `controllers/portfolioController.js` for a service like Cloudinary or
AWS S3.

## Customizing

- Edit the `profile` object and `projects` array at the top of
  `controllers/portfolioController.js` — that's the single source of truth
  for the name, bio, stats, social links, and project cards shown across
  pages.
- Replace the placeholder avatar circle in `views/portfolio/index.ejs`
  (search for "portrait placeholder") with your own photo in `public/images/`.
- Colors and fonts are defined in `tailwind.config.js` under `theme.extend`.
