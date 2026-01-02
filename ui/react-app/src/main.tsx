"use client";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "./pages/Home";
import { Profile } from "./pages/Profile";
import { Topics } from "./pages/Topics";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { WebSocketProvider } from "./providers/WebsocketProvider";
import { ModalProvider } from "./providers/ModalProvider";

const queryClient = new QueryClient();

const wsHost =
  process.env.NODE_ENV === "development"
    ? "localhost:8000"
    : window.location.host;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider
        url={`ws://${wsHost}/ws/socket-server/`}
        reconnectInterval={2000}
      >
        <ModalProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <BrowserRouter>
            <Routes>
              <Route index element={<Home />} />
              <Route path="topics" element={<Topics />} />
              <Route path="profile" element={<Profile />} />
            </Routes>
          </BrowserRouter>
        </ModalProvider>
      </WebSocketProvider>
    </QueryClientProvider>
  </StrictMode>
);
