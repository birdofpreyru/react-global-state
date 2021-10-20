# Environment Variables

### REACT_GLOBAL_STATE_DEBUG

The [REACT_GLOBAL_STATE_DEBUG] variable can be set to any truthy value in Node
environment (or injected into the client-side bundle using the Webpack's
[EnvironmentPlugin](https://webpack.js.org/plugins/environment-plugin))
to enable debug logging by **react-global-state** library. In either case
the logging is enabled for non-production code only, which is tested by
`process.env.NODE_ENV` value being distinct from "**production**".

[REACT_GLOBAL_STATE_DEBUG]: #react_global_state_debug
