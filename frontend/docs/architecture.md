# Frontend architecture

The frontend follows a layered, feature-oriented structure. Dependencies flow
only from upper layers to lower layers:

```text
app → pages → widgets → features → entities → shared
```

## Layers

- `app` — application bootstrap, providers, router, and global styles.
- `pages` — route-level composition. Pages coordinate features but do not own
  reusable business logic.
- `widgets` — large reusable page regions composed from features and entities.
- `features` — user actions and complete business capabilities.
- `entities` — domain models and entity-specific presentation.
- `shared` — infrastructure, configuration, generic utilities, and UI
  primitives. It must not know about product features.

## Rules

1. A layer can import only itself or a layer to its right in the diagram.
2. Network calls live in `shared/api`; endpoint-specific schemas live with the
   feature or entity that owns them.
3. Server state uses TanStack Query. Local component state stays local until it
   must be shared.
4. API responses are validated with Zod at the boundary.
5. Reusable UI primitives contain no product-specific business rules.
6. Pages are loaded lazily by the router to keep route bundles independent.
7. Imports use `@/` aliases across layers and relative paths only within a
   tightly coupled module.

`npm run lint` includes an architecture check that rejects upward imports.
