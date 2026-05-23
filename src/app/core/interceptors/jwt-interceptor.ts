import {
  HttpInterceptorFn
} from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (
  req,
  next
) => {

  // Public APIs
  const isAuthApi =

    req.url.includes('/api/auth/login') ||

    req.url.includes('/api/auth/signup');

  // Skip token for auth APIs
  if (isAuthApi) {

    return next(req);
  }

  // Get token
  let token = null;

if (typeof window !== 'undefined') {

  token =
    localStorage.getItem(
      'token'
    );
}

  // Add JWT token
  if (token) {

    req = req.clone({

      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};