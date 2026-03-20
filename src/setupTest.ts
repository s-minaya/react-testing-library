import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen());// Configurar MSW antes de todas las pruebas
afterEach(() => server.resetHandlers()); // Limpiar cualquier handler después de cada prueba para evitar interferencias entre pruebas
afterAll(() => server.close()); // Cerrar el servidor después de todas las pruebas