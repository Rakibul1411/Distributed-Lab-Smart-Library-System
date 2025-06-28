import { CircuitBreaker } from './circuitBreaker.js';

const circuitBreaker = new CircuitBreaker('http://host.docker.internal:80');

class HttpService {
  static async getUser(userId) {
    try {
      const response = await circuitBreaker.call(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error.message);
      throw error;
    }
  }

  static async getBook(bookId) {
    try {
      const response = await circuitBreaker.call(`/api/books/${bookId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching book:', error.message);
      throw error;
    }
  }

  static async updateBookAvailability(bookId, operation) {
    try {
      const response = await circuitBreaker.call(
        `/api/books/${bookId}/availability`,
        { available_copies: 1, operation },
        'patch'
      );
      return response.data;
    } catch (error) {
      console.error('Error updating book availability:', error.message);
      throw error;
    }
  }
}

export default HttpService;
