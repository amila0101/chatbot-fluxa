import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App Component', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(document.querySelector('#root')).toBeTruthy();
  });

  test('renders with theme provider', () => {
    render(<App />);
    const appElement = screen.getByTestId('app-container');
    expect(appElement).toBeInTheDocument();
  });

  test('toggles theme when theme button is clicked', () => {
    render(<App />);
    const themeButton = screen.getByRole('button', { name: /toggle theme/i });
    
    // Initial theme
    expect(document.documentElement.classList.contains('dark')).toBeFalsy();
    
    // Toggle theme
    fireEvent.click(themeButton);
    expect(document.documentElement.classList.contains('dark')).toBeTruthy();
  });

  test('renders chatbot component', () => {
    render(<App />);
    const chatbotElement = screen.getByTestId('chatbot-container');
    expect(chatbotElement).toBeInTheDocument();
  });

  test('handles errors gracefully', () => {
    // Mock console.error to prevent error logging during test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<App />);
    
    // Simulate an error in the app
    const error = new Error('Test error');
    window.dispatchEvent(new ErrorEvent('error', { error }));
    
    // Check if error message is displayed
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
});

