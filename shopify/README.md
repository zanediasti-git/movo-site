# MOVO Boost Shopify theme

Custom Online Store 2.0 theme for MOVO Boost, plus a local Liquid preview so the design can be reviewed before a store exists.

```bash
cd shopify
npm install
npm run preview          # http://localhost:5174
```

When a store is ready, push as an **unpublished** theme. Do not publish, connect `movoboost.com`, or enable live sales without approval.

```bash
npm run theme:push-unpublished
```

Full admin checklist, metafield definitions, and the draft product CSV: [`docs/admin-setup.md`](docs/admin-setup.md).
