import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError: () => void;
}

interface State {
  failed: boolean;
}

/** Catches WebGL/R3F initialisation errors and chunk-load failures for the lazy scene. */
export class SceneErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.warn('[hero] 3D scene disabled:', error, info.componentStack);
    this.props.onError();
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}
