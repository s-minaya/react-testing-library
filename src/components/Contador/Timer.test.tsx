import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Timer from './Timer';

describe("<Timer />", () => {
    it("Debería mostrar el valor inicial", async () => {
        render(<Timer />);
        const timer = screen.getByText("Timer: 0");
        expect(timer).toBeInTheDocument();
        await act(() => {            
            fireEvent.click(screen.getByText("Start"));
        })
    })
    it("Debería mostrar una palabra pausa cuando el timer se detiene", async () => {
        render(<Timer />);
        const boton = screen.getByText("Start");
        await act(() => {            
            fireEvent.click(boton);
        })
       
    })
})