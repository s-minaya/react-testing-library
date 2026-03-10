import { describe, it, expect, vi, Mock } from "vitest";
import {
  render,
  screen,
  act,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { getAuth } from "../../services/getAuth";
import { SessionProvider } from "../../context/AuthContext";
import { Login } from "./Login";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../services/getAuth", () => ({
  getAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
const mockGetAuth = getAuth as Mock;

describe("<Login />", () => {
  const handleLogin = () => {
    return render(
      <SessionProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </SessionProvider>,
    );
  };

  it("Debería mostrar un mensaje de error", async () => {
    mockGetAuth.mockRejectedValue(new Error("Invalid credentials"));
    handleLogin();
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const buttonLogin = screen.getByRole("button", { name: "Login" });

    await act(() => {
      fireEvent.change(usernameInput, { target: { value: "wrongUser" } });
      fireEvent.change(passwordInput, { target: { value: "wrongPassword" } });
      fireEvent.click(buttonLogin);
    });
    const errorMessage = screen.getByText("Invalid credentials");
    expect(errorMessage).toBeInTheDocument();
  });

  it("Debería redirigir a /orders", async () => {
    mockGetAuth.mockResolvedValue({ success: true });
    handleLogin();

    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const buttonLogin = screen.getByRole("button", { name: "Login" });

    await act(() => {
      fireEvent.change(usernameInput, { target: { value: "validUser" } });
      fireEvent.change(passwordInput, { target: { value: "validPassword" } });
      fireEvent.click(buttonLogin);
    });
    await waitFor(() => {
      expect(mockGetAuth).toHaveBeenCalledWith("validUser", "validPassword");
      expect(mockNavigate).toHaveBeenCalledWith("/orders");
    });
  });
  it("Debería mostrar la contraseña y cambiar el botón a hide", async () => {
    handleLogin();
    const passwordInput = screen.getByPlaceholderText("Password");
    const toggleButton = screen.getByRole("button", { name: "show" });

    await act(() => {
      fireEvent.click(toggleButton);
      fireEvent.change(passwordInput, { target: { value: "password" } });

      expect(passwordInput).toHaveAttribute("type", "text");
      expect(toggleButton).toHaveTextContent("hide");
    });
  });

  it("Debería ocultar la contraseña y cambiar el botón a show", async () => {
    handleLogin();
    const passwordInput = screen.getByPlaceholderText("Password");
    const toggleButton = screen.getByRole("button", { name: "show" });

    await act(() => {
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      fireEvent.change(passwordInput, { target: { value: "password" } });

      expect(passwordInput).toHaveAttribute("type", "password");
      expect(toggleButton).toHaveTextContent("show");
    });
  });
});
