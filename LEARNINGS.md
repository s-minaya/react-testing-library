# 🧪 Testing en React con Vitest

Resumen completo del curso de testing con Vitest y React Testing Library. Cubre desde la configuración inicial hasta técnicas avanzadas como mocks, spies, MSW y cobertura de código.

---

## Índice

1. [Filosofía del testing](#filosofía-del-testing)
2. [Configuración del entorno](#configuración-del-entorno)
3. [Estructura de un test](#estructura-de-un-test)
4. [Primeros tests: funciones puras](#primeros-tests-funciones-puras)
5. [Tests de componentes React](#tests-de-componentes-react)
6. [Table-Driven Testing](#table-driven-testing)
7. [Test-Driven Development (TDD)](#test-driven-development-tdd)
8. [Mocks](#mocks)
9. [Tests de Login con mocks](#tests-de-login-con-mocks)
10. [Tests de componentes con roles](#tests-de-componentes-con-roles)
11. [Principios SOLID aplicados](#principios-solid-aplicados)
12. [Tests de Custom Hooks](#tests-de-custom-hooks)
13. [Spies](#spies)
14. [Mock Service Worker (MSW)](#mock-service-worker-msw)
15. [Cobertura de código (Coverage)](#cobertura-de-código-coverage)
16. [¿Cuándo no escribir tests?](#cuándo-no-escribir-tests)

---

## Filosofía del testing

> *"The more your tests resemble the way your software is used, the more confidence they can give you."*
> — Kent C. Dodds (creador de Testing Library)

Testing Library se basa en una premisa simple: **no testear la implementación (el "cómo"), sino el resultado (el "qué")**. Esto garantiza que los tests sigan siendo válidos aunque el código interno cambie.

### La pirámide del testing

```
         /\
        /E2E\          ← End-to-end: cubren APIs, BBDDs, flujos completos
       /------\
      /  Integ. \      ← Integración: varios unit tests funcionando juntos
     /------------\
    /  Unit Tests   \  ← Unitarios: funciones y componentes aislados
   /________________\
```

---

## Configuración del entorno

### Instalación de dependencias

```bash
npm install --save-dev @testing-library/react @testing-library/dom @types/react @types/react-dom vitest jsdom
npm install --save-dev @testing-library/jest-dom
```

Estas dependencias van en `devDependencies` porque **solo se usan en desarrollo** y no deben incluirse en el bundle de producción.

| Paquete | Para qué sirve |
|---|---|
| `vitest` | Test runner principal del proyecto |
| `jsdom` | Virtualiza el DOM del navegador en el entorno de test |
| `@testing-library/react` | Utilidades para renderizar y consultar componentes React |
| `@testing-library/dom` | Queries base para interactuar con el DOM |
| `@testing-library/jest-dom` | Matchers extra para las aserciones (`toBeInTheDocument`, etc.) |

### `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',       // Simula el DOM del navegador
        globals: true,              // describe/it/expect disponibles sin importar
        setupFiles: ['./src/setupTest.ts'],
    },
});
```

### `src/setupTest.ts`

```ts
import '@testing-library/jest-dom';
```

Este archivo se ejecuta antes de cada suite de tests e inyecta los matchers de jest-dom globalmente.

### Script en `package.json`

```json
"scripts": {
    "test": "vitest",
    "coverage": "vitest run --coverage"
}
```

---

## Estructura de un test

Todo test se compone de tres bloques:

| Bloque | Propósito |
|---|---|
| `describe` | Agrupa los casos de prueba de una misma unidad |
| `it` / `test` | Define un caso de prueba individual |
| `expect` | Declara la aserción: qué resultado se espera |

```ts
import { describe, it, expect } from 'vitest';

describe('nombre del bloque (qué se está probando)', () => {
    it('descripción del caso de prueba', () => {
        // Arrange: preparar datos
        // Act: ejecutar la lógica
        // Assert: comprobar el resultado
        expect(resultado).toBe(valorEsperado);
    });
});
```

> **Convención de nombres:** los archivos de test deben llamarse `NombreComponente.test.tsx` o `NombreComponente.test.ts`. Vitest los detecta automáticamente por esta extensión.

---

## Primeros tests: funciones puras

```ts
import { describe, it, expect } from 'vitest';

describe('Mi primer test', () => {
    it('la suma de dos números', () => {
        const suma = (a: number, b: number) => a + b;
        const resultado = suma(2, 3);
        expect(resultado).toBe(5);
    });
});
```

Para ejecutar un archivo de test concreto:

```bash
npx vitest run src/ruta/del/archivo.test.ts
# o con npm
npm run test -- --run src/ruta/del/archivo.test.ts
```

---

## Tests de componentes React

Para testear un componente se usa `render` (para montarlo) y `screen` (para consultar el DOM resultante).

### Verificar que el componente se renderiza

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('<Button />', () => {
    it('Debería renderizar el botón', () => {
        render(<Button label="click" />);
        const button = screen.getByText('click');
        expect(button).toBeInTheDocument();
    });
});
```

### Simular interacciones del usuario

Para simular eventos (clicks, cambios en inputs...) se usan `fireEvent` y `act`. `act` garantiza que React procese todos los efectos antes de hacer la aserción.

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Button } from './Button';

describe('<Button />', () => {
    it('Debería llamar a la función onClick al hacer clic', async () => {
        const handleClick = vi.fn(); // Función mock
        render(<Button label="Click" onClick={handleClick} />);
        const button = screen.getByText('Click');

        await act(() => {
            fireEvent.click(button);
        });

        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
```

### Queries más comunes de `screen`

| Query | Cuándo usarla |
|---|---|
| `getByText('texto')` | Buscar un elemento por su contenido de texto |
| `getByRole('button', { name: 'Login' })` | Buscar por rol ARIA y nombre accesible |
| `getByPlaceholderText('Username')` | Buscar un input por su placeholder |
| `getAllByRole('heading', { level: 3 })` | Obtener todos los elementos de un rol |
| `queryByText('texto')` | Como `getBy` pero devuelve `null` si no existe (no lanza error) |
| `getByTestId('id')` | Por `data-testid` — **último recurso**, usar con moderación |

---

## Table-Driven Testing

Los tests repetitivos son un antipatrón. Cuando varios casos de prueba tienen el mismo flujo pero distintos datos de entrada y salida, se usa **Table-Driven Testing**: centralizar los casos en un array e iterar sobre ellos con `it.each`.

**Ventajas:**

- **Mantenibilidad:** basta con editar el array para añadir o cambiar casos.
- **Legibilidad:** entradas y salidas esperadas están juntas y son fáciles de leer.
- **Eficiencia:** un solo bloque `it` cubre todos los casos.
- **Cobertura:** es más difícil olvidar casos edge cuando están todos en el mismo sitio.

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Calculator } from './Calculator';

describe('<Calculator />', () => {
    const useCasesTest = [
        { a: 1, b: 2, operation: 'add', expected: 3 },
        { a: 3, b: 2, operation: 'multiply', expected: 6 },
    ];

    it.each(useCasesTest)(
        'Debería devolver $expected cuando $a y $b son $operation',
        ({ a, b, operation, expected }) => {
            render(<Calculator a={a} b={b} operation={operation} />);
            const result = screen.getByText(`Result: ${expected}`);
            expect(result).toBeInTheDocument();
        }
    );
});
```

---

## Test-Driven Development (TDD)

TDD invierte el orden habitual: **primero se escriben los tests, luego el código** que los hace pasar. El objetivo es poder refactorizar con seguridad en el futuro.

### El ciclo RED → GREEN → BLUE

```
  🔴 RED          🟢 GREEN        🔵 BLUE (REFACTOR)
  ─────────       ──────────      ──────────────────
  Escribe el      Escribe el      Refactoriza el
  test. Falla     código mínimo   código. Los tests
  porque no       para que el     te protegen de
  existe código.  test pase.      introducir bugs.
```

> **Cuándo aplica TDD:** cuando ya tienes claridad sobre todos los casos de uso del software. No aplica bien en fases experimentales donde los requisitos cambian constantemente.

### Ejemplo: componente `Contador`

**Paso 1 — Escribir el test (RED):**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Contador } from '.';

describe('<Contador />', () => {
    it('Debería mostrar el valor inicial', () => {
        render(<Contador />);
        expect(screen.getByText('Contador: 0')).toBeInTheDocument();
    });

    it('Debería incrementar el contador', async () => {
        render(<Contador />);
        const boton = screen.getByText('Incrementar');
        await act(() => { fireEvent.click(boton); });
        expect(screen.getByText('Contador: 1')).toBeInTheDocument();
    });
});
```

**Paso 2 — Escribir el componente (GREEN):**

```tsx
import { useState } from 'react';

export const Contador = () => {
    const [contador, setContador] = useState(0);
    const handleIncrementar = () => setContador(contador + 1);

    return (
        <div>
            <p>Contador: {contador}</p>
            <button onClick={handleIncrementar}>Incrementar</button>
        </div>
    );
};
```

**Paso 3 — Refactorizar (BLUE):** cualquier refactor del componente (extraer lógica, renombrar funciones...) seguirá pasando los tests sin tocarlos.

---

## Mocks

Un **mock** es un reemplazo controlado de una dependencia real. Se usan cuando el código depende de algo externo (una API, una base de datos, el tiempo del sistema...) que no se quiere o no se puede usar en el entorno de test.

### Tipos de mocks

**Mock de datos** — datos de prueba que sustituyen a los reales:
```ts
const dataMock = [
    { id: 1, title: 'Título 1' },
    { id: 2, title: 'Título 2' },
];
```

**Mock de función** — registra llamadas sin ejecutar lógica real:
```ts
const mockFn = vi.fn();
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith('argumento');
```

**Mock de módulo** — reemplaza un módulo completo importado:
```ts
vi.mock('./database', () => ({
    query: vi.fn(),
}));
```

**Mock de módulo con importación parcial** (`importActual`) — reemplaza solo algunas exportaciones, manteniendo el resto del módulo original:
```ts
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,               // Mantiene todo lo demás
        useNavigate: () => mockNavigate,  // Solo sustituye esto
    };
});
```

**Mock de promesas:**
```ts
const mockApi = vi.fn()
    .mockResolvedValue({ data: 'success' })   // Promesa resuelta
    .mockRejectedValue(new Error('error'));    // Promesa rechazada
```

### Cuándo usar mocks

✅ Cuando dependes de servicios externos (APIs, bases de datos).  
✅ Cuando el comportamiento es no determinista (fechas, números aleatorios).  
✅ Para mejorar la eficiencia (evitar llamadas costosas en cada test).  
✅ Para probar casos edge difíciles de reproducir en producción.

### Peligros de los mocks

- **Demasiados mocks = tests frágiles.** Si mockeas todo, los tests no prueban nada real.
- **Mock incorrecto = falsa confianza.** Si el mock no refleja la respuesta real de la API, el test pasa aunque el código esté roto.
- **Sobre-mockear = perder casos reales.** Algunos bugs solo aparecen con la integración real.

> Usar mocks con sabiduría, no con conveniencia.

---

## Tests de Login con mocks

Ejemplo completo que combina mocks de módulos, promesas y eventos de usuario.

```tsx
import { describe, it, expect, vi, Mock } from 'vitest';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Sustituye BrowserRouter en tests
import { getAuth } from '../../services/getAuth';
import { SessionProvider } from '../../context/AuthContext';
import { Login } from './Login';

// Mock de useNavigate manteniendo el resto de react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

// Mock del servicio de autenticación
vi.mock('../../services/getAuth', () => ({ getAuth: vi.fn() }));

const mockNavigate = vi.fn();
const mockGetAuth = getAuth as Mock;

describe('<Login />', () => {
    // Función helper para no repetir el render en cada test
    const handleLogin = () => render(
        <SessionProvider>
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        </SessionProvider>
    );

    it('Debería mostrar un mensaje de error con credenciales incorrectas', async () => {
        mockGetAuth.mockRejectedValue(new Error('Invalid credentials'));
        handleLogin();

        await act(() => {
            fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'wrongUser' } });
            fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongPassword' } });
            fireEvent.click(screen.getByRole('button', { name: 'Login' }));
        });

        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('Debería redirigir a /orders con credenciales correctas', async () => {
        mockGetAuth.mockResolvedValue({ success: true });
        handleLogin();

        await act(() => {
            fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'validUser' } });
            fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'validPassword' } });
            fireEvent.click(screen.getByRole('button', { name: 'Login' }));
        });

        // waitFor espera a que se resuelvan efectos asíncronos antes de la aserción
        await waitFor(() => {
            expect(mockGetAuth).toHaveBeenCalledWith('validUser', 'validPassword');
            expect(mockNavigate).toHaveBeenCalledWith('/orders');
        });
    });
});
```

> **`MemoryRouter`** es el sustituto de `BrowserRouter` para entornos de test. No depende de la URL del navegador y funciona en jsdom.

> **`it.skip`** — añadir `.skip` a un `it` lo omite temporalmente. Útil para aislar un caso mientras se trabaja en otro.

---

## Tests de componentes con roles

Cuando un componente tiene partes que solo se muestran para ciertos roles, hay que testear ambas ramas.

```tsx
describe('<Orders />', () => {
    // ...configuración de mocks...

    it('Debería mostrar las órdenes para cualquier usuario', async () => {
        mockGetOrders.mockResolvedValue(mockOrders);
        handleRenderOrders('visualizer');

        await waitFor(() => {
            const orders = screen.getAllByRole('heading', { level: 3 });
            expect(orders).toHaveLength(mockOrders.length);
        });
    });

    it('Debería mostrar la sección de resumen solo para superadmins', async () => {
        mockGetOrders.mockResolvedValue(mockOrders);
        handleRenderOrders('superadmin');

        await waitFor(() => {
            expect(screen.getByText('Orders Summary (Only admins)')).toBeInTheDocument();
            expect(screen.getByTestId('totalOrders')).toHaveTextContent(String(mockOrders.length));
        });
    });

    it('No debería mostrar el resumen a un visualizer', async () => {
        mockGetOrders.mockResolvedValue(mockOrders);
        handleRenderOrders('visualizer');

        await waitFor(() => {
            // queryBy devuelve null en lugar de lanzar error si no encuentra el elemento
            expect(screen.queryByText('Orders Summary (Only admins)')).not.toBeInTheDocument();
        });
    });
});
```

> **`data-testid`** se añade al HTML (`<p data-testid="totalOrders">`) cuando no hay otra forma semántica de identificar un elemento. Es el último recurso; preferir siempre queries basadas en texto o rol.

---

## Principios SOLID aplicados

Refactorizar siguiendo SOLID hace el código más testeable. El ejemplo del curso extrae la lógica de `Orders.tsx` a un custom hook `useOrders.ts`.

| Principio | Descripción | Ejemplo en el curso |
|---|---|---|
| **S** — Single Responsibility | Cada módulo tiene una sola razón para cambiar | Separar lógica de negocio del componente en un hook |
| **O** — Open/Closed | Abierto a extensión, cerrado a modificación | Añadir funcionalidades sin tocar el código existente |
| **L** — Liskov Substitution | Las abstracciones son intercambiables | Cualquier implementación de un servicio puede sustituirse |
| **I** — Interface Segregation | Interfaces pequeñas y específicas | Props bien definidas por componente |
| **D** — Dependency Inversion | Depender de abstracciones, no de implementaciones | El hook recibe dependencias inyectadas, facilitando el mock |

---

## Tests de Custom Hooks

Para testear hooks sin renderizar un componente completo se usa `renderHook` de Testing Library.

```ts
import { describe, it, expect, vi, Mock } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { getOrders } from '../services/getOrders';
import { useSession } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useOrders } from './useOrders';

vi.mock('../services/getOrders', () => ({ getOrders: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useSession: vi.fn() }));
vi.mock('react-router-dom', () => ({ useNavigate: vi.fn() }));

describe('useOrders', () => {
    const mockGetOrders = getOrders as Mock;
    const mockUseSession = useSession as Mock;

    it('debería obtener las órdenes correctamente', async () => {
        mockGetOrders.mockResolvedValue(mockOrders);
        mockUseSession.mockReturnValue({ user: { id: '1' } });

        const { result } = renderHook(() => useOrders());

        // Estado inicial: loading = true antes de que se resuelva la promesa
        expect(result.current.loading).toBe(true);

        // Esperamos a que la promesa resuelva
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.orders).toEqual(mockOrders);
        expect(result.current.error).toBeNull();
    });
});
```

`renderHook` devuelve `result`, que expone `result.current` con todos los valores y funciones que retorna el hook en ese momento.

---

## Spies

Un **spy** envuelve una función real y registra sus llamadas **sin reemplazar su comportamiento**. La diferencia clave con un mock de función es que el spy apunta a la implementación original: si ésta tiene un bug, el test lo detectará.

```
Mock de función          Spy
────────────────         ────────────────────────────
Reemplaza la función     Envuelve la función original
No ejecuta código real   Puede ejecutar código real
Siempre pasa si la       Falla si la función real
  implementación falla     tiene un error
```

### Configuración con `beforeEach` y `afterEach`

```ts
import { describe, it, expect, vi, MockInstance, beforeEach, afterEach, Mock } from 'vitest';
import * as AuthContext from '../context/AuthContext';
import * as OrderService from '../services/getOrders';
import * as ReactRouter from 'react-router-dom';

vi.mock('react-router-dom', () => ({ useNavigate: vi.fn() }));

describe('useOrdersSpy', () => {
    let useSessionSpy: MockInstance;
    let getOrdersSpy: MockInstance;
    const mockNavigate = vi.fn();

    beforeEach(() => {
        // Crear los spies antes de cada test
        useSessionSpy = vi.spyOn(AuthContext, 'useSession');
        getOrdersSpy = vi.spyOn(OrderService, 'getOrders');
        (ReactRouter.useNavigate as Mock).mockReturnValue(mockNavigate);
        vi.clearAllMocks(); // Limpiar contadores de llamadas
    });

    afterEach(() => {
        vi.restoreAllMocks(); // Restaurar implementaciones originales
    });

    it('debería mostrar un error cuando la API falla', async () => {
        useSessionSpy.mockReturnValue({ user: { id: 1 } });
        getOrdersSpy.mockRejectedValue(new Error('Api error'));

        const { result } = renderHook(() => useOrders());

        await waitFor(() => {
            expect(result.current.error).toBe('Failed to fetch orders. Please try again later.');
            expect(getOrdersSpy).toHaveBeenCalledTimes(1); // El spy registra la llamada
        });
    });
});
```

> **Importante:** `vi.spyOn` solo funciona con módulos locales del proyecto, no con dependencias externas de `node_modules`. Para éstas hay que usar `vi.mock`.

---

## Mock Service Worker (MSW)

MSW intercepta las peticiones HTTP a nivel de red, simulando un servidor real en el entorno de test. Esto elimina los **flakey tests** (tests inestables por depender de servicios externos).

```
Sin MSW                              Con MSW
───────────────────────────          ──────────────────────────────
Test → getOrders() → fetch()         Test → getOrders() → fetch()
         ↓                                    ↓
    API real (puede estar caída)       Service Worker intercepta
         ↓                                    ↓
    Resultado impredecible           Respuesta controlada y estable
```

### Instalación

```bash
npm install msw --save-dev
```

### `src/mocks/handlers.ts` — definir los endpoints simulados

```ts
import { http, HttpResponse } from 'msw';

export const handlers = [
    http.get('http://localhost:3001/orders', () => {
        return HttpResponse.json([
            // Array con los datos mock que queremos devolver
            { id: '1', customer: { name: 'John Doe' }, total: 1029.98, /* ... */ }
        ]);
    }),
];
```

### `src/mocks/server.ts` — configurar el servidor

```ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### `src/setupTest.ts` — arrancar el servidor antes de los tests

```ts
import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen());       // Arrancar antes de todos los tests
afterEach(() => server.resetHandlers()); // Limpiar handlers personalizados entre tests
afterAll(() => server.close());          // Cerrar al terminar todos los tests
```

### Uso en un test con wrapper

```tsx
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionProvider>
        <MemoryRouter>{children}</MemoryRouter>
    </SessionProvider>
);

it('debe obtener la data correctamente', async () => {
    const { result } = renderHook(() => useOrders(), { wrapper });

    await waitFor(() => {
        expect(result.current.orders.length).toBe(1);
    });
});
```

### Simular un error 500 en un test específico

```ts
it('debe gestionar un error 500', async () => {
    // Sobreescribe el handler solo para este test
    server.use(
        http.get('http://localhost:3001/orders', () => {
            return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
        })
    );

    const { result } = renderUseOrders();

    await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch orders. Please try again later.');
    });
});
```

> `server.use(...)` dentro de un test sobreescribe un handler puntualmente. Como el `afterEach` llama a `server.resetHandlers()`, el handler original se restaura automáticamente para el siguiente test.

---

## Cobertura de código (Coverage)

La cobertura mide qué porcentaje del código está siendo ejercitado por los tests.

### Tipos de cobertura

| Tipo | Qué mide |
|---|---|
| **Statement** | Cada sentencia del código |
| **Branch** | Cada rama lógica (if/else, operadores ternarios) |
| **Function** | Cada función declarada |
| **Line** | Cada línea del archivo |

### Instalación y uso

```bash
npm install -D @vitest/coverage-v8
npm run coverage
```

Genera una carpeta `coverage/` con un `index.html` que se puede abrir en el navegador para ver el detalle visual. Añadir al `.gitignore`:

```
coverage
```

### Configuración en `vitest.config.ts`

```ts
export default defineConfig({
    test: {
        // ...
        coverage: {
            // Excluir archivos que no necesitan cobertura
            exclude: [
                '**/*.config.ts',
                '**/*.config.js',
                '**/*.types.ts',
                '**/*.d.ts',
                '**/types',
            ],
            // Umbral mínimo (el CI fallará si no se alcanza)
            thresholds: {
                functions: 80,
            },
        },
    },
});
```

> El **threshold** es la regla que impide subir código si la cobertura cae por debajo del mínimo acordado en el equipo. Un valor habitual en la industria es **80%**.

---

## ¿Cuándo no escribir tests?

Escribir tests no siempre es la decisión correcta. Hay dos situaciones donde puede no merecer la pena:

**Fase experimental:** si el software está en plena exploración y los requisitos cambian cada día, los tests quedarán obsoletos constantemente. Es mejor esperar a que el diseño se estabilice.

**Proyectos de vida muy corta:** para un proyecto de una o dos semanas, el coste de escribir tests puede superar el beneficio. Si el proyecto crece o se vuelve importante, ese es el momento de incorporarlos.

---

*Testing no es solo una práctica técnica, es una mentalidad orientada a construir software robusto y de confianza.*