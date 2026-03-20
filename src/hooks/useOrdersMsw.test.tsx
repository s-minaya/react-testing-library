import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useOrders } from './useOrders';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider, useSession } from '../context/AuthContext';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('../context/AuthContext', async () => {
    const actual = await vi.importActual('../context/AuthContext');
    return {
        ...actual,
        useSession: vi.fn(),
    };
});

describe('useOrders MSW', () => {
    const mockUser = {id: "1", name: "Sofia Minaya"};
    beforeEach(() => {
        (useSession as Mock).mockReturnValue({ user: mockUser });
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>
            <MemoryRouter>
                {children}
            </MemoryRouter>
        </SessionProvider>
    )

    it("debe obtener bien la data", async () => {
        const { result } = renderHook(() => useOrders(), { wrapper });
        const initialLoading = result.current.loading;
        expect(initialLoading).toBe(true);
        await waitFor(() => {
            const lengthOrders = result.current.orders.length;
            expect(lengthOrders).toBe(1);
        });
        
    });
});