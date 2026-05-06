export const readListResponse = async <T>(response: Response): Promise<T[]> => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.error ||
      data?.detail ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

export const fetchList = async <T>(url: string): Promise<T[]> => {
  const response = await fetch(url);
  return readListResponse<T>(response);
};
