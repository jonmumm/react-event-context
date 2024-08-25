// src/__tests__/index.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createEventContext } from '../index';
import { z } from 'zod';

const TestEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('CLICK'), x: z.number(), y: z.number() }),
  z.object({ type: z.literal('HOVER'), elementId: z.string() }),
]);

type TestEvent = z.infer<typeof TestEventSchema>;

const TestEventContext = createEventContext(TestEventSchema);

const TestComponent: React.FC = () => {
  const send = TestEventContext.useSend();
  const [lastEvent, setLastEvent] = React.useState<string>('');

  TestEventContext.useEventHandler('CLICK', (event) => {
    setLastEvent(`Clicked at (${event.x}, ${event.y})`);
  });

  TestEventContext.useEventHandler('HOVER', (event) => {
    setLastEvent(`Hovered over ${event.elementId}`);
  });

  return (
    <div>
      <button onClick={() => send({ type: 'CLICK', x: 10, y: 20 })}>Click me</button>
      <div onMouseEnter={() => send({ type: 'HOVER', elementId: 'test-div' })}>Hover me</div>
      <div data-testid="last-event">{lastEvent}</div>
    </div>
  );
};

const SubscribeComponent: React.FC = () => {
  const [events, setEvents] = React.useState<TestEvent[]>([]);

  TestEventContext.useSubscribe((event) => {
    setEvents((prevEvents) => [...prevEvents, event]);
  });

  return (
    <div>
      {events.map((event, index) => (
        <div key={index} data-testid={`event-${index}`}>
          {JSON.stringify(event)}
        </div>
      ))}
    </div>
  );
};

describe('react-event-hooks', () => {
  it('should handle click events', () => {
    render(
      <TestEventContext.Provider>
        <TestComponent />
      </TestEventContext.Provider>
    );
    const button = screen.getByText('Click me');
    fireEvent.click(button);
    expect(screen.getByTestId('last-event')).toHaveTextContent('Clicked at (10, 20)');
  });

  it('should handle hover events', () => {
    render(
      <TestEventContext.Provider>
        <TestComponent />
      </TestEventContext.Provider>
    );
    const div = screen.getByText('Hover me');
    fireEvent.mouseEnter(div);
    expect(screen.getByTestId('last-event')).toHaveTextContent('Hovered over test-div');
  });

  it('should throw error when used outside of Provider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSend must be used within an EventContext.Provider');

    consoleErrorSpy.mockRestore();
  });

  it('should subscribe to all events', async () => {
    render(
      <TestEventContext.Provider>
        <TestComponent />
        <SubscribeComponent />
      </TestEventContext.Provider>
    );

    const button = screen.getByText('Click me');
    const div = screen.getByText('Hover me');

    fireEvent.click(button);
    fireEvent.mouseEnter(div);

    await waitFor(() => {
      expect(screen.getByTestId('event-0')).toHaveTextContent('{"type":"CLICK","x":10,"y":20}');
      expect(screen.getByTestId('event-1')).toHaveTextContent('{"type":"HOVER","elementId":"test-div"}');
    });
  });
});