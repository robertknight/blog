// Type definitions for react Router 0.13.0
// Project: https://github.com/rackt/react-router
// Definitions by: Yuichi Murata <https://github.com/mrk21>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="DefinitelyTyped/react/react.d.ts" />

declare module 'react-router' {
	import react = require('react');

    //
    // Mixin
    // ----------------------------------------------------------------------
    interface Navigation {
        makePath(to: string, params?: {}, query?: {}): string;
        makeHref(to: string, params?: {}, query?: {}): string;
        transitionTo(to: string, params?: {}, query?: {}): void;
        replaceWith(to: string, params?: {}, query?: {}): void;
        goBack(): void;
    }
    
    interface RouteHandlerMixin {
        getRouteDepth(): number;
        createChildRouteHandler(props: {}): RouteHandler;
    }
    
    interface State {
        getPath(): string;
        getRoutes(): Route[];
        getPathname(): string;
        getParams(): {};
        getQuery(): {};
        isActive(to: string, params?: {}, query?: {}): boolean;
    }
    
    var Navigation: Navigation;
    var State: State;
    var RouteHandlerMixin: RouteHandlerMixin;
    
    
    //
    // Component
    // ----------------------------------------------------------------------
    // DefaultRoute
    interface DefaultRouteProp {
        name?: string;
        handler: react.ComponentClass<any>;
    }
    interface DefaultRoute extends react.ReactElement<DefaultRouteProp> {
        __react_router_default_route__: any; // dummy
    }
    interface DefaultRouteClass extends react.ComponentClass<DefaultRouteProp> {
        __react_router_default_route__: any; // dummy
    }
    
    // Link
    interface LinkProp {
        activeClassName?: string;
        to: string;
        params?: {};
        query?: {};
        onClick?: Function;
    }
    interface Link extends react.ReactElement<LinkProp>, Navigation, State {
        __react_router_link__: any; // dummy
        
        getHref(): string;
        getClassName(): string;
    }
    interface LinkClass extends react.ComponentClass<LinkProp> {
        __react_router_link__: any; // dummy
    }
    
    // NotFoundRoute
    interface NotFoundRouteProp {
        name?: string;
        handler: react.ComponentClass<any>;
    }
    interface NotFoundRoute extends react.ReactElement<NotFoundRouteProp> {
        __react_router_not_found_route__: any; // dummy
    }
    interface NotFoundRouteClass extends react.ComponentClass<NotFoundRouteProp> {
        __react_router_not_found_route__: any; // dummy
    }
    
    // Redirect
    interface RedirectProp {
        path?: string;
        from?: string;
        to?: string;
    }
    interface Redirect extends react.ReactElement<RedirectProp> {
        __react_router_redirect__: any; // dummy
    }
    interface RedirectClass extends react.ComponentClass<RedirectProp> {
        __react_router_redirect__: any; // dummy
    }
    
    // Route
    interface RouteProp {
        name?: string;
        path?: string;
        handler?: react.ComponentClass<any>;
        ignoreScrollBehavior?: boolean;
    }
    interface Route extends react.ReactElement<RouteProp> {
        __react_router_route__: any; // dummy
    }
    interface RouteClass extends react.ComponentClass<RouteProp> {
        __react_router_route__: any; // dummy
    }
    
    // RouteHandler
    interface RouteHandlerProp {}
    interface RouteHandler extends react.ReactElement<RouteHandlerProp>, RouteHandlerMixin {
        __react_router_route_handler__: any; // dummy
    }
    interface RouteHandlerClass extends react.ComponentClass<RouteHandlerProp> {
        __react_router_route_handler__: any; // dummy
    }
    
    var DefaultRoute: DefaultRouteClass;
    var Link: LinkClass;
    var NotFoundRoute: NotFoundRouteClass;
    var Redirect: RedirectClass;
    var Route: RouteClass;
    var RouteHandler: RouteHandlerClass;
    
    
    //
    // Location
    // ----------------------------------------------------------------------
    interface LocationBase {
        push(path: string): void;
        replace(path: string): void;
        pop(): void;
        getCurrentPath(): void;
    }
    
    interface LocationListener {
        addChangeListener(listener: Function): void;
        removeChangeListener(listener: Function): void;
    }
    
    interface HashLocation extends LocationBase, LocationListener {}
    interface HistoryLocation extends LocationBase, LocationListener {}
    interface RefreshLocation extends LocationBase {}
    
    var HashLocation: HashLocation;
    var HistoryLocation: HistoryLocation;
    var RefreshLocation: RefreshLocation;
    
    
    //
    // Behavior
    // ----------------------------------------------------------------------
    interface ScrollBehaviorBase {
        updateScrollPosition(position: {x: number; y: number;}, actionType: string): void;
    }
    interface ImitateBrowserBehavior extends ScrollBehaviorBase {}
    interface ScrollToTopBehavior extends ScrollBehaviorBase {}
    
    var ImitateBrowserBehavior: ImitateBrowserBehavior;
    var ScrollToTopBehavior: ScrollToTopBehavior;
    
    
    //
    // Router
    // ----------------------------------------------------------------------
    interface Router extends react.ComponentClass<any> {
        run(callback: RouterRunCallback): void;
    }
    
    interface RouterState {
        path: string;
        action: string;
        pathname: string;
        params: {};
        query: {};
        routes : Route[];
    }
    
    interface RouterCreateOption {
        routes: Route;
        location?: LocationBase;
        scrollBehavior?: ScrollBehaviorBase;
    }
    
    type RouterRunCallback = (Handler: Router, state: RouterState) => void;
    
    function create(options: RouterCreateOption): Router;
    function run(routes: Route, callback: RouterRunCallback): Router;
    function run(routes: Route, location: LocationBase | string, callback: RouterRunCallback): Router;
    
    
    //
    // History
    // ----------------------------------------------------------------------
    interface History {
        back(): void;
        length: number;
    }
    var History: History;
    
    
    //
    // Transition
    // ----------------------------------------------------------------------
    interface Transition {
        abort(): void;
        redirect(to: string, params?: {}, query?: {}): void;
        retry(): void;
    }
    
    interface TransitionStaticLifecycle {
        willTransitionTo?(
            transition: Transition,
            params: {},
            query: {},
            callback: Function
        ): void;
        
        willTransitionFrom?(
            transition: Transition,
            component: react.ReactElement<any>,
            callback: Function
        ): void;
    }
}

declare module 'react' {
	import router = require('react-router');

    interface TopLevelAPI {
        // for DefaultRoute
        createElement(
            type: router.DefaultRouteClass,
            props: router.DefaultRouteProp,
            ...children: ReactNode[]
        ): router.DefaultRoute;
        
        // for Link
        createElement(
            type: router.LinkClass,
            props: router.LinkProp,
            ...children: ReactNode[]
        ): router.Link;
        
        // for NotFoundRoute
        createElement(
            type: router.NotFoundRouteClass,
            props: router.NotFoundRouteProp,
            ...children: ReactNode[]
        ): router.NotFoundRoute;
        
        // for Redirect
        createElement(
            type: router.RedirectClass,
            props: router.RedirectProp,
            ...children: ReactNode[]
        ): router.Redirect;
        
        // for Route
        createElement(
            type: router.RouteClass,
            props: router.RouteProp,
            ...children: ReactNode[]
        ): router.Route;
        
        // for RouteHandler
        createElement(
            type: router.RouteHandlerClass,
            props: router.RouteHandlerProp,
            ...children: ReactNode[]
        ): router.RouteHandler;
    }
}
