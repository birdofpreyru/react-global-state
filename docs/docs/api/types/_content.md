- [AsyncCollectionLoaderT] &mdash; The signature of a valid data loader function
  for [useAsyncCollection()] hook.
- [AsyncCollectionT] &mdash; The type of a global state segment managed by
  the [useAsyncCollection()] hook.
- [AsyncDataEnvelopeT] &mdash; The type of a state segment storing data managed
  by [useAsyncData()] and [useAsyncCollection()] hooks, alongside related meta-data.
- [AsyncDataLoaderT] &mdash; The signature of a valid data loader function for
  [useAsyncData()] hook.
- [ForceT] &mdash; A special type for &laquo;unlocking&raquo; overloads of
  hooks and functions that allow to enforce arbitrary value types.
- [SetterT] &mdash; The type of setter returned by the [useGlobalState()] hook.
- [UseAsyncDataOptionsT] &mdash; The type of options object accepted by
  [useAsyncData()] and [useAsyncCollection()] hooks.
- [UseAsyncCollectionResT] &mdash; The type of result possibly returned by
  [useAsyncCollection()] hooks (depends on hook arguments).
- [UseAsyncDataResT] &mdash; The type of result returned by [useAsyncData()]
  and, possibly, [useAsyncCollection()] hooks (depends on hook arguments).
- [UseGlobalStateResT] &mdash; The type of result returned by
  the [useGlobalState()] hook.
- [ValueOrInitializerT] &mdash; The type for arguments that accept either
  a value to use, or a function that returns the value to use.

[AsyncCollectionLoaderT]: /docs/api/types/async-collection-loader
[AsyncCollectionT]: /docs/api/types/async-collection
[AsyncDataEnvelopeT]: /docs/api/types/async-data-envelope
[AsyncDataLoaderT]: /docs/api/types/async-data-loader
[ForceT]: /docs/api/types/force
[SetterT]: /docs/api/types/setter
[useAsyncCollection()]: /docs/api/hooks/useasynccollection
[useAsyncData()]: /docs/api/hooks/useasyncdata
[UseAsyncDataOptionsT]: /docs/api/types/use-async-data-options
[UseAsyncCollectionResT]: /docs/api/types/use-async-collection-res
[UseAsyncDataResT]: /docs/api/types/use-async-data-res
[useGlobalState()]: /docs/api/hooks/useglobalstate
[UseGlobalStateResT]: /docs/api/types/use-global-state-res
[ValueOrInitializerT]: /docs/api/types/value-or-initializer
