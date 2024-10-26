// ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error capturado en ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Ocurrió un error al cargar esta sección.</h2>;
    }
    return this.props.children; 
  }
}

export default ErrorBoundary;
