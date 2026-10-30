TEMS HAIR WEBSITE

The public store is mobile-friendly static HTML/CSS. Cloudflare Pages Functions
provide the shared catalog API and PIN-protected admin. D1 stores catalog,
availability, appointment rules and resized product photos. Existing example
product photos remain regular files in assets/products/. No R2 bucket or payment
card is needed.

LOCAL PREVIEW
1. Install Node.js and npm if needed.
2. Copy .dev.vars.example to .dev.vars and set a private 6-12 digit ADMIN_PIN
   plus a long random SESSION_SECRET. Never commit .dev.vars.
3. Create a D1 database with `npx wrangler d1 create tems-hair-catalog` and put
   its returned database_id into wrangler.toml.
4. Apply the local schema: `npx wrangler d1 migrations apply tems-hair-catalog --local`.
5. Start the full Pages app with `npx wrangler pages dev .`.
6. Open /admin-login in the same browser and sign in with ADMIN_PIN.

The older `python -m http.server` preview serves the static files only. It does
not run Functions or the database; use Wrangler for admin and API testing.

ADMIN
Admin entry: /admin-login (extensionless when deployed). After sign-in, use
/admin-products to add, edit, hide, show or remove extensions and ponytails,
change prices and colours, upload resized photos (stored in D1), and edit the WhatsApp preparation
notice. The first admin sign-in seeds the starter catalog into D1. Starter
prices and names are examples and should be replaced with Tems's confirmed
details. Admin sessions expire after 8 hours. Five failed PIN attempts block
further attempts for 15 minutes.

CLOUDFLARE DEPLOYMENT
1. Create a Cloudflare Pages project connected to this Git repository.
2. Create a production D1 database and update `database_id` in wrangler.toml.
3. Apply the migration to the production database using Wrangler.
4. Set the Pages production secrets ADMIN_PIN and SESSION_SECRET. Use a private
   6-12 digit PIN and a long random session secret.
5. Deploy the main branch. Cloudflare Pages provides a pages.dev URL. Connect a
   custom domain such as temshair.com later if one is available.

The `_redirects` file gives visitors clean routes such as /book and /extensions.
All WhatsApp links use 0906 906 9847. A customer must still tap Continue in the
pre-WhatsApp notice. Tems can edit the notice in the admin when the final rules
are ready. Wigs remain marked Coming Soon.
