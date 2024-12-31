import { buggerAllChange, getMiddle, isDevelopment, roundDown, roundUp } from '~common';

export const getPrice = async (id: string, signal: AbortSignal): Promise<number> => {
  let minimum = 50_000;
  let maximum = 30_000_000;
  let searchValue = getMiddle(minimum, maximum);

  const maxRequests = 14;
  for (let i = 0; i < maxRequests; i++) {
    const url = `https://platform.realestate.co.nz/search/v1/listings?filter[category][]=res_sale&filter[saleMin]=${searchValue}&filter[saleMax]=${maximum}&filter[listingId][]=${id}`;
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        signal
      });

      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

      const data = (await response.json()) as SearchResponse;
      const results = data.data.map(x => x.id);
      if (results.includes(id)) {
        minimum = searchValue;
        searchValue = getMiddle(minimum, maximum);

        // Check percentage change between the old search value and the new search value to save on requests
        if (buggerAllChange(minimum, searchValue)) {
          if (isDevelopment()) {
            console.table({ search: searchValue.toLocaleString(), min: minimum.toLocaleString(), max: maximum.toLocaleString() });
            console.log(`Property ${id} found: $${searchValue.toLocaleString()} after ${i + 1} requests.`, roundUp(searchValue));
          }

          return roundUp(searchValue);
        }
      } else {
        maximum = searchValue;
        searchValue = getMiddle(minimum, maximum);

        // Check percentage change between the old search value and the new search value to save on requests
        if (buggerAllChange(searchValue, maximum)) {
          if (isDevelopment()) {
            console.table({ search: searchValue.toLocaleString(), min: minimum.toLocaleString(), max: maximum.toLocaleString() });
            console.log(`Property ${id} missing: $${maximum.toLocaleString()} after ${i + 1} requests.`, roundDown(maximum));
          }

          return roundDown(maximum);
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  console.log(`Failed to find property in ${maxRequests} requests`);
  return roundUp(searchValue);
};
