import type { SuiClient, SuiObjectResponse } from '@mysten/sui/client';

type QueryObjectsPage = {
  data: SuiObjectResponse[];
  hasNextPage: boolean;
  nextCursor: string | null;
};

/** Query shared / indexed objects by Move struct type (wraps `suix_queryObjects`). */
export async function queryObjectsByStructType(
  client: SuiClient,
  structType: string,
  limit = 50,
): Promise<SuiObjectResponse[]> {
  const page = await client.call<QueryObjectsPage>('suix_queryObjects', [
    {
      query: {
        filter: { StructType: structType },
        options: { showContent: true, showType: true },
      },
      limit,
    },
  ]);
  return page.data ?? [];
}
