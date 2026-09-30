# Troubleshooting

## Common Issues

### Database Connection Error
**Symptoms:** 500 error on loading shop or admin.
**Fix:** Verify `MYSQL_*` variables in `.env.local`. Ensure AivenCloud IP allowlists permit your server.

### Email Failing
**Symptoms:** Checkout completes but no email received.
**Fix:** Verify `SMTP_PASSWORD` and `SMTP_PORT` (typically 465 for secure, 587 for TLS). Check Hostinger mailbox limits.
