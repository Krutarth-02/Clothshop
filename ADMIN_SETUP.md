# Store administration

## Access

- Login: `http://localhost:5173/admin/login`
- Dashboard: `http://localhost:5173/admin`
- Sign in with an existing User account whose role is `admin` or `superadmin`.
  For a new installation, follow the first-owner setup below.
- Use **Administrators → Edit record** to change an admin password. Password changes
  sign out existing admin sessions for that account.

## Accounts and roles

All accounts live in the existing `User` collection. There is no separate Admin
account model. `User.role` is `user`, `admin`, or `superadmin`.

| Role | Access |
| --- | --- |
| user | Storefront; cannot sign in to admin APIs |
| admin | Dashboard, product/customer management, order fulfillment, activity log |
| superadmin | All admin features plus administrator/role management |

Customer and administrator logins use separate cookies. A customer cookie, even for
a staff user, does not authorize an admin API. Public signup always assigns `user`.
Customer account mutation/recovery routes do not manage staff accounts. Staff can
still use their account for normal storefront access, with the customer session.

An owner can create a new admin under **Administrators → Add admin**. To promote an
existing customer, use **Customers → Edit record → Account role → Administrator**.
Only an owner can assign roles. Existing account IDs and purchases are preserved.
Owners cannot be demoted/deleted in the panel; users cannot delete their own account.

## First owner for another installation

1. Register the intended owner through the existing customer signup page, with a
   strong password, at least 12 characters.
2. From a trusted server terminal run:

```powershell
cd D:\Clothshop\clothshopbackend
node scripts/createAdmin.js owner@your-company.com
```

The script promotes that existing account to `superadmin`; it does not overwrite its
password or profile. Running it again for an existing owner leaves the account alone.
The script requires server/database access and is not exposed through public APIs.

## Configuration

Backend `.env`:

```dotenv
MONGODB_URL=your-existing-mongodb-connection
JWT_SECRET=your-existing-customer-signing-secret
ADMIN_JWT_SECRET=a-private-random-secret-of-at-least-32-characters
FRONTEND_URL=http://localhost:5173
PORT=3001
```

Generate a strong independent admin key with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Paste the output into the private `.env`; do not put signing keys into frontend code
or commit them. Changing this key invalidates existing admin cookies. Restart the
backend after editing environment settings. If `ADMIN_JWT_SECRET` is absent, the
existing `JWT_SECRET` is used only if it is at least 32 characters; an independent
admin key is recommended. Use strong independent signing keys in production.

Frontend `.env` must point to the actual backend port:

```dotenv
VITE_BACKEND_API_URL=http://localhost:3001/api
```

Start the backend with `node app.js`, frontend with `npm run dev` in their respective
folders. Match `FRONTEND_URL` to the real origin; do not mix localhost and 127.0.0.1.

## Features and data behavior

- Overview uses a grouped sidebar, three KPI cards, monthly collections graph,
  collections/refund panels, recent orders, stock report, active customer countries,
  popular items and monthly order bars. Header search links to the product table.
- Metrics come from MongoDB. Collected revenue includes only `paid` payments.
  Monthly collections use `paidAt`, in UTC, with zero-filled missing months.
  Pending collection is separate from collected revenue. Customer engagement means
  customers who logged in within 30 days; it does not mean currently online users.
  Profit, advertising expenses, traffic and geolocation are not invented.
- Products support search/pagination and create/read/update/delete, including
  colours, sizes, actual colour image URLs and size measurements.
- Customer/admin forms reuse Formik and existing shared modals. Passwords are hashed
  using bcrypt. New/reset passwords must be 12+ characters, up to 72 UTF-8 bytes.
- Order creation stays in the existing checkout service, preserving stock, pricing,
  coupon and duplicate-order protections. Admin updates fulfillment forward through
  `confirmed`, `processing`, `shipped`, `delivered`. Totals/payment status and purchase
  history are not arbitrarily edited/deleted. Refund/payment reconciliation and
  stock-restoring cancellation require separate workflows.
- Customer deletion retains purchase history. Existing checkout item snapshots
  remain in orders after product deletion. Deleting a product/account is permanent
  and requires confirmation in the UI.
- Activity records admin writes/sign-ins, customer registration/login and checkout
  orders from this implementation onward. Existing historical events are not
  backfilled. It is an operations log, not clickstream analytics. Activity logging is
  best-effort and never records request bodies/passwords/tokens. Order retry logging
  is idempotent through the `ORDER_PLACED` unique partial index.
- Dashboard refreshes each minute; the activity page every 30 seconds. These are
  polling updates, not WebSocket streams.

## Structure

Existing code and naming conventions are extended:

```text
clothshopbackend/
  controllers/admin.controller.js     # named auth/dashboard/CRUD/activity handlers
  routes/admin.routes.js              # explicit protected admin endpoints
  middlewares/admin.middleware.js     # cookie, role, origin and activity checks
  models/AdminActivity.js             # required persistent operations log
  scripts/createAdmin.js              # trusted first-owner setup
  models/User.js                     # role enum and private admin session version
  models/Payment.js                  # fulfillment status
  controllers/auth.controller.js     # existing signup activity
  controllers/payment.controller.js  # existing checkout activity
  controllers/user.controller.js     # protect staff account mutations
  services/loginActivity.js          # existing login events reused

clothshopfrontend/src/
  pages/Admin/AdminLogin.jsx
  pages/Admin/AdminDashboard.jsx
  pages/Admin/AdminManagement.jsx     # shared product/user/order/activity table/forms
  routes/AdminRoute.jsx
  routes/AdminLayout.jsx
  redux/admin/adminApi.js
```

Existing `AuthLayout`, `AuthField`, `CommonModal`, `ActionMenu`, loader/error/avatar/
logo components, product option helpers, Mantine and RTK Query are reused. There is
no extra admin Redux store, account model, chart library or new package dependency.
Backend handlers use the existing shared errors and `next(error)` convention.

## API contract and protection

Prefix `/api/admin`. All writes require the configured frontend Origin.

| Endpoint | Access / result |
| --- | --- |
| POST /login | email/password; staff only; HttpOnly cookie; login rate limit |
| GET /session | `{data: user}`; logged out/invalid cookie yields 200 `{data:null}` |
| POST /logout | Revokes that account's admin sessions |
| GET /dashboard | Summary/paid collection data; authenticated staff |
| GET /products | Search/page; `{data,total,page,limit:15}` |
| POST /products, PUT/DELETE /products/:id | Validated product CRUD |
| GET /users | Customers; `staff=true` gives staff, owner-only |
| POST /users, PUT/DELETE /users/:id | Role-scoped user/admin CRUD; owners protected |
| GET /orders | Confirmed order details, search/page |
| PUT /orders/:id | Only forward fulfillment updates |
| GET /activity | Actor/action/result/timestamp; paginated |

Authorization is checked on every backend request using the current User record,
role and session version. Admin JWTs require a dedicated audience/admin ID claim;
customer tokens cannot be substituted. Changing a role/password or logging out
invalidates the relevant admin session version; deletion removes access immediately.
Admin cookies expire after 8 hours. This version uses password sign-in without MFA.
Login is limited to 10 attempts per IP per 15 minutes; admin requests have a separate
per-IP rate limit. Limiters are process-local; use a shared store/edge rate limiting
for a multi-instance deployment.

Production requires HTTPS (`NODE_ENV=production` makes the cookie Secure), private
keys, same-site API routing (`SameSite=Strict`), correctly configured reverse proxy,
database backups and monitored logs. A URL such as `/admin` is discoverable; access
control comes from authentication and backend permissions. Configure SPA deep-link
fallback to `index.html`. Review deployment/MFA/payment/refund requirements before
selling a production installation; this feature is not a security certification.

## Troubleshooting

- Secret length/configuration error: set a strong `ADMIN_JWT_SECRET` and restart.
- Invalid administrator credentials: verify the account exists, has a password and
  role admin/superadmin. A normal customer email does not grant admin access.
- An empty database has no default administrator. Register the intended account,
  then run the trusted first-owner setup command. There are no hardcoded credentials.
- Old errors shown with browser Network “Keep log” enabled may be earlier responses.
  Inspect the latest request.

## Validation

The frontend production build, targeted ESLint and changed backend syntax checks
pass. Local API checks covered role/cookie authorization, staff permissions, Origin
validation, protected financial fields and session revocation. Rendering checks
covered the dashboard with populated fixtures and URL-based search/pagination.
Browser visual QA and production deployment verification remain separate checks.
