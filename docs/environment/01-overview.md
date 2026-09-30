# Environment Variables

> Purpose: Configuration requirements.

## `.env.local`

| Variable | Purpose | Required | Environment |
|---|---|---|---|
| `MYSQL_HOST` | Database host | Yes | All |
| `MYSQL_PORT` | Database port | Yes | All |
| `MYSQL_USER` | DB user | Yes | All |
| `MYSQL_PASSWORD` | DB password | Yes | All |
| `MYSQL_DATABASE` | DB name | Yes | All |
| `ADMIN_NAME` | Admin display name | No | Setup |
| `ADMIN_EMAIL` | Admin login email | No | Setup |
| `ADMIN_PASSWORD` | Admin initial password | No | Setup |
| `SOLA_API_KEY` | Payment processing | Yes | Prod/Dev |
| `NEXT_PUBLIC_IFIELDS_KEY` | Cardknox ifields | Yes | Prod/Dev |
| `SMTP_HOST` | Email server | Yes | Prod/Dev |
| `SMTP_PORT` | Email port | Yes | Prod/Dev |
| `SMTP_USER` | Email user | Yes | Prod/Dev |
| `SMTP_PASSWORD` | Email password | Yes | Prod/Dev |

*Note: Never commit actual values to git.*
