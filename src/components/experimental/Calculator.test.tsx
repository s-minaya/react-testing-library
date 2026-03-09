import {describe, it, expect} from 'vitest';
import { render, screen } from '@testing-library/react';
import { Calculator } from './Calculator';

describe("<Calculator />", () => {
    const useCasesTest = [
        {a: 1, b: 2, operation: "add", expected: 3},
        {a: 3, b: 2, operation: "multiply", expected: 6},
        {a: 5, b: 2, operation: "subtract", expected: 3},
        {a: 10, b: 2, operation: "divide", expected: 5},
        {a: 10, b: 0, operation: "divide", expected: "Error"},
        
    ]

    it.each(useCasesTest)('Debería devolver $expected cuando $a y $b son $operation', ({a, b, operation, expected}) => {
        render(<Calculator a={a} b={b} operation={operation} />);
        const result = screen.getByText(`Result: ${expected}`);
        expect(result).toBeInTheDocument();
    })
})