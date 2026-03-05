import {describe, it, expect} from 'vitest';

describe('Mi primer test', () => {
    it('la suma de dos numeros', () => {
        const suma = (a: number,b: number) => a + b;
        const resultado = suma(2, 3);
        expect(resultado).toBe(5);
    });

    it('dos textos iguales', () => {
        const text1 = 'Hola mundo!';
        const text2 = 'Hola mundo!';
        expect(text1).toBe(text2);

    });
it('un objeto con las mismas propiedades', () => {
    const obj1 = {nombre: 'Sofi', edad: 30};
    const obj2 = {nombre: 'Sofi', edad: 30};
    expect(obj1).toEqual(obj2);
});
it('un valor es verdadero', () => {
    const valor = true;
    expect(valor).toBeTruthy();
});
it('un elemento está presente en un array', () => {
    const array = ['nigiri', 'shushi', 'wakame'];
    expect(array).toContain('wakame');
});

it('un valor está definido', () => {
    const valor = 'Hola';
    expect(valor).toBeDefined();
});

it('si una cadena coincide con un patrón regular', () => {
    const email = 'cualquier.email@email.com';
    expect(email).toMatch(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/);
});
});
