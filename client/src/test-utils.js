import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from './context/ThemeContext';

const AllTheProviders = ({ children }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
