import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Button } from './Button';

describe('<Button />', () => {

    it('Debería renderizar el botón', () => {
        render(<Button label="click" />);
        const button = screen.getByText("click");
        expect(button).toBeInTheDocument();

    });

    it('Debería llamar a la función onClick al hacer clic', async () => {
        const handleClick = vi.fn();
        render(<Button label="Click" onClick={handleClick} />);
        const button = screen.getByText("Click");
        await act(() => {
            fireEvent.click(button);

        });
        expect(handleClick).toHaveBeenCalledTimes(1);

    })
})