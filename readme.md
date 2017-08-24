
## Overview

This is a simplified version of [@adriaanmeuris's example](https://github.com/Automattic/mongoose/issues/4513#issuecomment-319181814) of mongoose issue [4513](https://github.com/Automattic/mongoose/issues/4513).

It shows how Mongoose can gets in a state where callbacks stop happening.

It makes a very slow query, then shows that future queries never call back.


### Instructions

You may need to tweak the duration of the long query. I had to set it to **10 minutes** to reproduce the error consistently.

    const LONG_QUERY_DURATION_IN_MS = 10 * 60 * 1000;

I'm running it on `MacOS 10.12.6`, `Node v6.10.2`, `Mongoose 4.11.7`, `MongoDB 3.2.9`.

### Output

I get the following output:

    > node run.js
    6) Database connecting...
    27) Database connected...
    27) Dropping...
    66) Creating...
    588) FastQuery-A: starting...
    591) FastQuery-A: success: 1
    1591) SlowQuery: starting...
    2589) FastQuery-B: starting...
    362591) SlowQuery: failed: MongoError: connection 0 to localhost:27017 timed out
    362591) FastQuery-B: failed: MongoError: connection 0 to localhost:27017 timed out
    605585) FastQuery-C: starting...
    1210581) Giving Up...


`SlowQuery` times out then `FastQuery-C` starts and never calls back.

If I run a query from another process, it runs fine (so the database isn't locked).

