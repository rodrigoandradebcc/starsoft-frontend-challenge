'use client';
import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR = 'button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';

interface FocusTrapOptions {
  /** Enquanto verdadeiro, o Tab circula dentro do container e Escape dispara `onEscape`. */
  active: boolean;
  containerRef: RefObject<HTMLElement | null>;
  /** Elemento que recebe o foco na abertura. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  onEscape: () => void;
}

/**
 * Mantém o foco dentro de um container modal e devolve o foco ao elemento
 * de origem quando ele fecha.
 */
export function useFocusTrap({
  active,
  containerRef,
  initialFocusRef,
  onEscape,
}: FocusTrapOptions) {
  // Mantém o callback atualizado sem reiniciar o efeito a cada render.
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  });

  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement as HTMLElement | null;
    initialFocusRef?.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscapeRef.current();
        return;
      }
      if (event.key !== 'Tab' || !containerRef.current) return;
      const focusable = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      opener?.focus();
    };
  }, [active, containerRef, initialFocusRef]);
}
