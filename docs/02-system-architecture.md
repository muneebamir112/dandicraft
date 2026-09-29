# 02 - System Architecture

## Architecture

```mermaid
flowchart TD
User --> Frontend[Next.js Frontend]
Frontend --> API[Next.js API Routes]
API --> Database[(MySQL Database)]
API --> ExternalServices[SMTP]
```
