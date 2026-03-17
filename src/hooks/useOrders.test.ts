import { describe, it, expect, vi, Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { getOrders } from "../services/getOrders";
import { useSession } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useOrders } from "./useOrders";

vi.mock("../services/getOrders", () => ({
  getOrders: vi.fn(),
}));

vi.mock("../context/AuthContext", () => ({
  useSession: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

describe("useOrders", () => {
  const mockNavigate = vi.fn();
  const mockGetGetOrders = getOrders as Mock;
  const mockUseSession = useSession as Mock;
  const mockUseNavigate = useNavigate as Mock;

  it("debería obtener las órdenes!", async () => {
    const mockOrders = [
      {
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        customer: {
          id: "60d07f61-99bf-4b90-955b-5d3a7c9bb3d4",
          name: "John Doe",
          email: "john.doe@example.com",
        },
        products: [
          {
            id: "7567ec4b-b10c-48c5-9345-fc73c48a80a2",
            name: "Laptop",
            price: 999.99,
            quantity: 1,
          },
          {
            id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
            name: "Mouse",
            price: 29.99,
            quantity: 1,
          },
        ],
        total: 1029.98,
        status: "delivered",
        orderDate: "2023-10-01T10:00:00Z",
        shippingAddress: {
          street: "123 Main St",
          city: "Anytown",
          state: "CA",
          zipCode: "12345",
          country: "USA",
        },
        paymentMethod: "credit_card",
      },
    ];

    mockGetGetOrders.mockResolvedValue(mockOrders);
    mockUseSession.mockReturnValue({ user: { id: "1" } });
    mockUseNavigate.mockReturnValue(mockNavigate);

    const { result } = renderHook(() => useOrders());

    // Justo al montar, loading debe ser true (antes de que resuelva la petición)
    expect(result.current.loading).toBe(true);

    // Esperamos a que la promesa resuelva y loading pase a false
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      // Las órdenes se cargaron correctamente
      expect(result.current.orders).toEqual(mockOrders);
      expect(result.current.error).toBeNull();
    });
  });
});
