# react-event-context

![CI](https://github.com/jonmumm/react-event-context/workflows/CI/badge.svg)

A lightweight, type-safe event management library for React applications. Create typed event buses with Zod schemas, enabling decoupled communication and centralized event handling in complex React apps.

## Features

- 🔒 Create type-safe event contexts
- 📡 Send and handle events with full type support
- 🔔 Subscribe to all events for advanced use cases
- ✅ Leverage Zod schemas for runtime type checking
- 🔌 Easy integration with existing React applications

## Installation

```bash
npm install react-event-context zod
```

## Usage

### 1. Define Your Event Schema

First, define your event schema using Zod:

```typescript
import { z } from 'zod';

const AppEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('CLICK'), x: z.number(), y: z.number() }),
  z.object({ type: z.literal('HOVER'), elementId: z.string() }),
  // Add more event types as needed
]);

type AppEvent = z.infer<typeof AppEventSchema>;
```

### 2. Create an Event Context

Create an event context using the `createEventContext` function:

```typescript
import { createEventContext } from 'react-event-hooks';

export const AppEventContext = createEventContext(AppEventSchema);
```

### 3. Wrap Your App with the Event Provider

Wrap your app or a part of it with the created event context provider:

```jsx
import { AppEventContext } from './AppEventContext';

function App() {
  return (
    <AppEventContext.Provider>
      {/* Your app components */}
    </AppEventContext.Provider>
  );
}
```

### 4. Send Events

Use the `useSend` hook to send events from any component within the context:

```jsx
import { AppEventContext } from './AppEventContext';

function ClickableComponent() {
  const send = AppEventContext.useSend();

  const handleClick = (e) => {
    send({ type: 'CLICK', x: e.clientX, y: e.clientY });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### 5. Handle Specific Events

Use the `useEventHandler` hook to listen for and handle specific events:

```jsx
import { AppEventContext } from './AppEventContext';

function EventListener() {
  AppEventContext.useEventHandler('CLICK', (event) => {
    console.log(`Clicked at (${event.x}, ${event.y})`);
  });

  AppEventContext.useEventHandler('HOVER', (event) => {
    console.log(`Hovered over ${event.elementId}`);
  });

  return null;
}
```

### 6. Subscribe to All Events

Use the `useSubscribe` hook to listen to all events:

```jsx
import { AppEventContext } from './AppEventContext';

function EventLogger() {
  AppEventContext.useSubscribe((event) => {
    console.log('Event received:', event);
  });

  return null;
}
```

## Typed Event Bus Concept

`react-event-hooks` allows you to create a typed event bus in your React application. This means:

1. **Type Safety**: All events are typed according to your Zod schema, providing compile-time checks and autocompletion.
2. **Centralized Event Management**: You can define all your application's events in one place, making it easier to understand and manage the event flow.
3. **Decoupled Communication**: Components can communicate without direct dependencies, improving modularity.
4. **Runtime Validation**: Zod schemas ensure that events conform to their expected shape at runtime.
5. **Flexibility**: You can easily add new event types or modify existing ones by updating your schema.

This approach is particularly useful for large applications with complex state management needs, or for applications that need to respond to many different types of events across multiple components.

## API Reference

### `createEventContext(schema: ZodSchema)`

Creates an event context based on the provided Zod schema.

Returns an object with the following properties:
- `Provider`: React context provider component
- `useSend`: Hook to get the send function for dispatching events
- `useEventHandler`: Hook to register event handlers for specific event types
- `useSubscribe`: Hook to subscribe to all events

### `[ContextName].useSend()`

Returns a function to send events that match the schema.

### `[ContextName].useEventHandler(eventType: string, handler: Function, dependencies: any[])`

Registers an event handler for the specified event type.

### `[ContextName].useSubscribe(handler: Function, dependencies: any[])`

Subscribes to all events, regardless of their type.

## TypeScript Support

This library is built with TypeScript and provides full type inference for your events based on the Zod schema you provide.

## Roadmap

We have several ideas for future improvements and features:

- [ ] Support for Other Schema Libraries: While we currently use Zod for its excellent TypeScript integration, we're considering adding support for other schema libraries like Yup or Joi.

- [ ] Additional Hooks: We're exploring ideas for more specialized hooks, such as:
  - `useLatestEvent`: To access the most recent event of a specific type
  - `useEventState`: To maintain state based on events
  - `useEventEffect`: To perform side effects in response to specific events

- [ ] Event History and Replay: 
  - Implement a way to inject an initial event history
  - Provide access to the event history
  - Add functionality to replay events
  This feature would be particularly useful for event sourcing and state machine implementations, allowing for time-travel debugging and state reconstruction.

- [ ] Performance Optimizations: Investigating ways to optimize event dispatch and subscription for high-frequency events.

- [ ] Middleware Support: Adding the ability to intercept and transform events before they reach handlers.

- [ ] Dev Tools: Creating developer tools for debugging and visualizing event flow in applications.

- [ ] React Native Support: Ensuring full compatibility with React Native for mobile app development.

We welcome community input on these ideas and any other suggestions for improving the library!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
