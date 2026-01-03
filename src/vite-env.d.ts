/// <reference types="vite/client" />

declare module 'react-simple-maps' {
    import * as React from 'react';

    export interface ComposableMapProps {
        width?: number;
        height?: number;
        projection?: string | ((width: number, height: number) => any);
        projectionConfig?: any;
        className?: string;
        style?: React.CSSProperties;
        children?: React.ReactNode;
    }

    export interface ZoomableGroupProps {
        center?: [number, number];
        zoom?: number;
        minZoom?: number;
        maxZoom?: number;
        translateExtent?: [[number, number], [number, number]];
        onMoveStart?: (position: { x: number; y: number; k: number }) => void;
        onMove?: (position: { x: number; y: number; k: number }) => void;
        onMoveEnd?: (position: { x: number; y: number; k: number }) => void;
        className?: string;
        style?: React.CSSProperties;
        children?: React.ReactNode;
    }

    export interface GeographiesProps {
        geography?: string | Record<string, any> | string[];
        children?: (args: { geographies: any[] }) => React.ReactNode;
        parseGeographies?: (geographies: any[]) => any[];
    }

    export interface GeographyProps {
        key?: string | number;
        geography?: any;
        onMouseEnter?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
        onMouseLeave?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
        onMouseDown?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
        onMouseUp?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
        onClick?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
        onFocus?: (event: React.FocusEvent<SVGPathElement>) => void;
        onBlur?: (event: React.FocusEvent<SVGPathElement>) => void;
        style?: {
            default?: React.CSSProperties;
            hover?: React.CSSProperties;
            pressed?: React.CSSProperties;
        };
        className?: string;
        [key: string]: any;
    }

    export const ComposableMap: React.FC<ComposableMapProps>;
    export const ZoomableGroup: React.FC<ZoomableGroupProps>;
    export const Geographies: React.FC<GeographiesProps>;
    export const Geography: React.FC<GeographyProps>;
}
