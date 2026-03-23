import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/registration-status/:wallet', () => {
    return HttpResponse.json({ registered: false });
  }),
  http.post('/api/verify', () => {
    return HttpResponse.json({ valid: true });
  }),
];
