/**
 * Base service for making API calls
 */
export class BaseService {
  /**
   * Base URL for API calls
   */
  protected baseUrl: string = '';

  /**
   * Constructor
   * @param baseUrl Base URL for API calls
   */
  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.baseUrl = baseUrl;
    }
  }

  /**
   * Make a GET request
   * @param endpoint API endpoint
   * @param params Query parameters
   * @returns Promise with the response data
   */
  protected async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json() as Promise<T>;
  }

  /**
   * Make a POST request
   * @param endpoint API endpoint
   * @param data Request body data
   * @returns Promise with the response data
   */
  protected async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json() as Promise<T>;
  }
}
