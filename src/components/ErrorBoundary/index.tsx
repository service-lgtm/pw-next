/*
 * @Author: yy
 * @Date: 2025-09-21 22:39:06
 * @LastEditTime: 2025-09-21 23:04:31
 * @LastEditors: yy
 * @Description: 
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

/** 错误边界 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo
        });
        this.props.onError?.(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // 错误回调处理
            if (this.props.fallback) {
                return typeof this.props.fallback === 'function'
                    ? this.props.fallback(this.state.error!, this.state.errorInfo!)
                    : this.props.fallback;
            }

            return (
                process.env.NODE_ENV === 'development' ?
                    <div className="min-h-screen border border-red-500 text-red-500 text-center p-4 rounded-md">
                        has some error
                    </div> : <></>
            );
        }

        return this.props.children;
    }
}
