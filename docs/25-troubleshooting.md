# 25 - Troubleshooting

## Database Connection Fails
**Symptoms:** 500 errors on API routes.
**Solution:** Verify `MYSQL_*` credentials in `.env.local`. Ensure MySQL server is running.

## Admin Cannot Login
**Symptoms:** Login rejected.
**Solution:** Run `npm run db:setup` with `ADMIN_EMAIL` and `ADMIN_PASSWORD` populated in env file to recreate/reset admin account.
