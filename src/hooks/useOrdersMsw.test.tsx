import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { useOrders } from "./useOrders";
import { SessionProvider, useSession } from "../context/AuthContext";

vi.mock("../context/AuthContext", async () => {
  const actual = await vi.importActual("../context/AuthContext");
  return {
    ...actual,
    useSession: vi.fn(),
  };
});

describe("useOrders MSW", () => {
  const mockUser = { id: "1", name: "Sofia Minaya" };
  beforeEach(() => {
    (useSession as Mock).mockReturnValue({ user: mockUser });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </SessionProvider>
  );

  const renderUseOrders = () => {
    return renderHook(() => useOrders(), { wrapper });
  };

  it("debe obtener bien la data", async () => {
    const { result } = renderUseOrders();
    const initialLoading = result.current.loading;
    expect(initialLoading).toBe(true);
    await waitFor(() => {
      const lengthOrders = result.current.orders.length;
      expect(lengthOrders).toBe(1);
    });
  });

  it("debe obtener un error", async () => {
    server.use(
      http.get("http://localhost:3001/orders", () => {
        return new HttpResponse(null, {
          status: 500,
          statusText: "Internal Server Error",
        });
      }),
    );

    const { result } = renderUseOrders();
    await waitFor(() => {
      const error = result.current.error;
      expect(error).toBe("Failed to fetch orders. Please try again later.");
    });
  });
});
