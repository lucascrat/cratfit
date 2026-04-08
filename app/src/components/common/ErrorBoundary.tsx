import React from 'react';

const IS_DEV = import.meta.env.DEV;

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Em produção, logar apenas o essencial (sem stack trace de usuário)
        if (IS_DEV) {
            console.error('Uncaught error:', error, errorInfo);
        } else {
            console.error('App error:', error?.message);
        }
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-red-500/10 border border-red-500 rounded-2xl p-6 max-w-md w-full">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">Ops! Algo deu errado.</h1>
                        <p className="text-gray-300 mb-6">
                            Ocorreu um erro inesperado. Tente recarregar o aplicativo.
                        </p>

                        {/* Stack trace visível apenas em desenvolvimento */}
                        {IS_DEV && this.state.error && (
                            <div className="bg-black/50 rounded-lg p-4 text-left overflow-auto max-h-48 text-xs font-mono mb-6 border border-white/10">
                                <p className="text-red-400 font-bold mb-2">{this.state.error.toString()}</p>
                                <pre className="text-gray-500">{this.state.errorInfo?.componentStack}</pre>
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
