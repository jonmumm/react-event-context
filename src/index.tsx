// src/index.tsx
import React, { createContext, useContext, useCallback, useEffect, ReactNode } from 'react';
import { z } from 'zod';

type AnyZodObject = z.ZodTypeAny;

type InferEventType<T extends AnyZodObject> = T extends z.ZodDiscriminatedUnion<'type', any>
  ? z.infer<T>['type']
  : never;

type EventHandler<T extends AnyZodObject> = (event: z.infer<T>) => void;

interface EventContextValue<T extends AnyZodObject> {
  send: (event: z.infer<T>) => void;
  subscribe: (handler: EventHandler<T>) => () => void;
}

function createEventContext<T extends AnyZodObject>(schema: T) {
  const EventContext = createContext<EventContextValue<T> | null>(null);

  const Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const handlers = React.useRef<Set<EventHandler<T>>>(new Set());

    const send = useCallback((event: z.infer<T>) => {
      const result = schema.safeParse(event);
      if (!result.success) {
        console.error('Invalid event:', result.error);
        return;
      }
      handlers.current.forEach((handler) => handler(event));
    }, []);

    const subscribe = useCallback((handler: EventHandler<T>) => {
      handlers.current.add(handler);
      return () => {
        handlers.current.delete(handler);
      };
    }, []);

    const value = React.useMemo(() => ({ send, subscribe }), [send, subscribe]);

    return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
  };

  function useSend() {
    const context = useContext(EventContext);
    if (!context) {
      throw new Error('useSend must be used within an EventContext.Provider');
    }
    return context.send;
  }

  function useEventHandler<K extends InferEventType<T>>(
    eventType: K,
    handler: (event: Extract<z.infer<T>, { type: K }>) => void,
    deps: React.DependencyList = []
  ) {
    const context = useContext(EventContext);
    if (!context) {
      throw new Error('useEventHandler must be used within an EventContext.Provider');
    }

    useEffect(() => {
      const wrappedHandler: EventHandler<T> = (event) => {
        if (event.type === eventType) {
          handler(event as Extract<z.infer<T>, { type: K }>);
        }
      };

      return context.subscribe(wrappedHandler);
    }, [context, eventType, ...deps]);
  }

  function useSubscribe(handler: EventHandler<T>, deps: React.DependencyList = []) {
    const context = useContext(EventContext);
    if (!context) {
      throw new Error('useSubscribe must be used within an EventContext.Provider');
    }

    useEffect(() => {
      return context.subscribe(handler);
    }, [context, ...deps]);
  }

  return {
    Provider,
    useSend,
    useEventHandler,
    useSubscribe,
  };
}

export { createEventContext };