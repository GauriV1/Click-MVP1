const ports = {
  frontend: process.env.PORT || 3000,
  backend: process.env.SERVER_PORT || 3000,
  api: process.env.API_PORT || 3000
};

export const getApiUrl = () => `http://localhost:${ports.api}`;
export const getBackendUrl = () => `http://localhost:${ports.backend}`;
export const getFrontendUrl = () => `http://localhost:${ports.frontend}`;

export default ports; 