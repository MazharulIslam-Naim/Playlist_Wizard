import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ', () => {
  render(<App />);
  const titleElement = screen.getByText((content, element) => {
    return element.tagName.toLowerCase() === 'h1' && content.startsWith('Playlist Wizard')
  })
  expect(titleElement).toBeInTheDocument();
});
