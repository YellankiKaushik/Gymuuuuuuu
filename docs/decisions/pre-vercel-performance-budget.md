# Keep the unchanged browser JavaScript budget

Portability validators and initializers load only when their browser action needs
them. Static references to specific owning exports inside lazy portability chunks
avoid retaining unused owning-module helpers.

The build groups the already shared Zod validation library into one chunk. This
reduces duplicated chunk imports and compression overhead. Tiny split route
wrappers share chunks within their own route family; their dependencies remain
separate. Private storage initializers and feature workspaces remain lazy. No factual content or
application feature is removed. The existing 700 KiB aggregate and 200 KiB chunk
limits remain unchanged. The final build, performance and browser checks must pass.
