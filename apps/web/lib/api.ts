const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000';

export class ApiError extends Error {
  status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.status = status;
  }
}

export function getToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(
    'prorabotka_token',
  );
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const isFormData =
    options.body instanceof FormData;

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,

      headers: {
        ...(!isFormData
          ? {
              'Content-Type':
                'application/json',
            }
          : {}),

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    },
  );

  if (response.status === 401) {
    if (
      typeof window !== 'undefined'
    ) {
      localStorage.removeItem(
        'prorabotka_token',
      );

      localStorage.removeItem(
        'prorabotka_user',
      );

      window.location.replace(
        '/login',
      );
    }

    throw new ApiError(
      'Unauthorized',
      401,
    );
  }

  if (!response.ok) {
    let message =
      'Something went wrong';

    try {
      const data =
        await response.json();

      if (
        typeof data?.message ===
        'string'
      ) {
        message =
          data.message;
      } else if (
        Array.isArray(
          data?.message,
        )
      ) {
        message =
          data.message.join(', ');
      }
    } catch {
      // ignore response parsing
    }

    throw new ApiError(
      message,
      response.status,
    );
  }

  if (
    response.status === 204
  ) {
    return undefined as T;
  }

  return response.json();
}

export function apiUrl(
  path: string,
) {
  return `${API_URL}${path}`;
}