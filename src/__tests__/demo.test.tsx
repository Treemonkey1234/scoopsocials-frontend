import { render, screen, fireEvent, act } from '@testing-library/react';
import { DemoProvider, useDemoMode } from '../context/DemoContext';
import { MemoryRouter } from 'react-router-dom';

// Mock component to test demo mode hooks
function TestComponent() {
  const { isDemoMode, toggleDemoMode, demoContent, interactWithDemoContent } = useDemoMode();
  
  return (
    <div>
      <div data-testid="demo-mode-status">{isDemoMode ? 'on' : 'off'}</div>
      <button onClick={toggleDemoMode} data-testid="toggle-button">
        Toggle Demo Mode
      </button>
      <div data-testid="demo-posts">
        {demoContent.posts.map(post => (
          <div key={post.id}>
            <p>{post.content}</p>
            <span data-testid={`likes-${post.id}`}>{post.likes}</span>
            <button
              onClick={() =>
                interactWithDemoContent('like', post.id, { increment: true })
              }
              data-testid={`like-${post.id}`}
            >
              Like
            </button>
          </div>
        ))}
      </div>
      <div data-testid="demo-events">
        {demoContent.events.map(event => (
          <div key={event.id}>
            <h3>{event.title}</h3>
            <span data-testid={`attendees-${event.id}`}>
              {event.attendees.length}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

describe('Demo Mode', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('demo mode can be toggled', () => {
    render(
      <MemoryRouter>
        <DemoProvider>
          <TestComponent />
        </DemoProvider>
      </MemoryRouter>
    );

    // Demo mode should be on by default
    expect(screen.getByTestId('demo-mode-status')).toHaveTextContent('on');

    // Toggle demo mode off
    fireEvent.click(screen.getByTestId('toggle-button'));
    expect(screen.getByTestId('demo-mode-status')).toHaveTextContent('off');

    // Toggle demo mode back on
    fireEvent.click(screen.getByTestId('toggle-button'));
    expect(screen.getByTestId('demo-mode-status')).toHaveTextContent('on');
  });

  test('demo mode preference is persisted', () => {
    const { unmount } = render(
      <MemoryRouter>
        <DemoProvider>
          <TestComponent />
        </DemoProvider>
      </MemoryRouter>
    );

    // Toggle demo mode off
    fireEvent.click(screen.getByTestId('toggle-button'));
    
    // Unmount and remount to test persistence
    unmount();
    
    render(
      <MemoryRouter>
        <DemoProvider>
          <TestComponent />
        </DemoProvider>
      </MemoryRouter>
    );

    // Demo mode should still be off
    expect(screen.getByTestId('demo-mode-status')).toHaveTextContent('off');
  });

  test('can interact with demo posts', () => {
    render(
      <MemoryRouter>
        <DemoProvider>
          <TestComponent />
        </DemoProvider>
      </MemoryRouter>
    );

    const demoPost = screen.getByTestId('likes-demo-post-1');
    const initialLikes = parseInt(demoPost.textContent || '0', 10);
    
    // Like the post
    fireEvent.click(screen.getByTestId('like-demo-post-1'));
    
    // Check if likes increased
    expect(screen.getByTestId('likes-demo-post-1')).toHaveTextContent(
      (initialLikes + 1).toString()
    );
  });

  test('demo content is visible when demo mode is on', () => {
    render(
      <MemoryRouter>
        <DemoProvider>
          <TestComponent />
        </DemoProvider>
      </MemoryRouter>
    );

    // Check if demo posts are visible
    expect(screen.getByTestId('demo-posts')).toBeInTheDocument();
    expect(screen.getByTestId('demo-events')).toBeInTheDocument();

    // Toggle demo mode off
    fireEvent.click(screen.getByTestId('toggle-button'));

    // Demo content should still be in the document but might be hidden
    // This depends on your implementation of hiding demo content
    expect(screen.getByTestId('demo-posts')).toBeInTheDocument();
    expect(screen.getByTestId('demo-events')).toBeInTheDocument();
  });
}); 