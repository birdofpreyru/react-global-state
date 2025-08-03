import {
  type AsyncDataEnvelopeT,
  type AsyncDataLoaderMetaT,
  useAsyncData,
} from './useAsyncData';

/** Base type of list items. */
export type ListItemT = { id: string };

/** List items, and related meta-data. */
export type ListT<ItemT extends ListItemT, QueryT> = {
  /** List items. */
  items: ItemT[];

  /**
   * The last page loaded into the list. In the "single page" mode it is also
   * the only page loaded at the moment; in the "progressive loading" mode it
   * is the last of the pages added to the list (and in that mode the pages
   * are loaded one after another, from index 0 to the `lastPage`).
   */
  lastPage: number;

  /** Page size. */
  pageSize: number;

  /** Filter the items have been filtered with, if any. */
  query: QueryT | undefined;

  /** The total number of pages available for the list. */
  totalNumPages: number | undefined;
};

/** Async data envelope for storing list items, and related data. */
export type AsyncListEnvelopeT<
  ItemT extends ListItemT,
  QueryT,
> = AsyncDataEnvelopeT<ListT<ItemT, QueryT>>;

export type UseAsyncListOptionsT<QueryT> = {
  page?: number;
  pageSize?: number;
  query?: QueryT;
  queryToString?: (query: QueryT | undefined) => string;
} & AsyncDataLoaderMetaT;

/** List loader. */
export type AsyncListLoaderT<ItemT extends ListItemT, QueryT> = (
  oldData: ListT<ItemT, QueryT> | null,
  options: UseAsyncListOptionsT<QueryT>,
) => {
  page: ItemT[];
  totalNumItems: number | undefined;
};

export type UseAsyncListResT<ItemT extends ListItemT> = {
  items: ItemT[];
  loading: boolean;
  loadMore: (() => void) | undefined;
  reload: () => void | Promise<void>;
  timestamp: number;
  totalNumPages: number | undefined;
};

// NOTE: As for query stringification, should we use "qs" lib
// by default, rather than just JSON.stringify? Probably it will
// safer? Or, probably "serialize-javascript"?

export function useAsyncList<
  StateT,
  PathT extends string | null | undefined,
  ItemT extends ListItemT, QueryT
>(
  path: string | null | undefined,
  loader: AsyncListLoaderT<ItemT, QueryT>,
  {

  }: UseAsyncListOptionsT<QueryT>,
): UseAsyncListResT<ItemT> {
  const e = useAsyncData<ListT<ItemT, QueryT>>(path, (oldData, meta) => {

  }, {

  });

  return {

  };
}
