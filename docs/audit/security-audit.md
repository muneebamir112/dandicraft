# Security Audit

## Findings
1. **Source Code Passwords**: The \`.env.local.example\` contains some default structures, and the current \`.env.local\` contains actual passwords. These must not be committed to Git.
2. **Admin Auth**: Verified that `bcryptjs` is used for hashing passwords in DB setup.
3. **Payments**: PCI compliance is aided by Cardknox iFields (React component).
