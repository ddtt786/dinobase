type SearchIndex = ["search_index", string, string, string, string];
type SearchIndexListSelector = ["search_index", string, string, string];

interface SearchOptions {
  value?: string;
  min?: number | string;
  max?: number | string;
  cursor?: string;
  limit?: number;
}

export type { SearchIndex, SearchIndexListSelector, SearchOptions };
