import { fetchPublishedContents } from "@/services/contentService";

test("content service queries accent-tolerant search term", async () => {
  const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ data: [] }),
  } as Response);

  await fetchPublishedContents({ q: "menstruacao" });

  expect(fetchMock.mock.calls[0][0]?.toString()).toContain("q=menstruacao");
  fetchMock.mockRestore();
});
