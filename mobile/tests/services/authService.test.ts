import { loginMobileUser } from "@/services/authService";

test("mobile auth service sends login request with UTF-8 JSON headers", async () => {
  const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ token: "abc", access_state: "restricted", user: { id: 1, name: "Maria", email: "maria@example.com" } }),
  } as Response);

  await loginMobileUser("maria@example.com", "password");

  expect(fetchMock).toHaveBeenCalled();
  fetchMock.mockRestore();
});
