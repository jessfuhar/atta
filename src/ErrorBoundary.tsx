import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Rede de segurança: um erro de render nunca mais vira tela branca — mostra uma mensagem e deixa recarregar. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[atta] erro inesperado:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="font-display text-2xl">Algo não carregou direito.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="border border-ink px-5 py-2 text-xs uppercase tracking-[0.12em]"
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
