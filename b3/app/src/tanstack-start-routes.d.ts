import "@tanstack/router-core";

type RouteServerHandler = (ctx: {
  request: Request;
  params?: Record<string, string>;
}) => Response | Promise<Response>;

declare module "@tanstack/router-core" {
  interface FilebaseRouteOptionsInterface {
    server?: {
      handlers?: Record<string, RouteServerHandler>;
      middleware?: unknown;
    };
  }
}

declare module "@tanstack/react-router" {
  interface FilebaseRouteOptionsInterface {
    server?: {
      handlers?: Record<string, RouteServerHandler>;
      middleware?: unknown;
    };
  }
}
