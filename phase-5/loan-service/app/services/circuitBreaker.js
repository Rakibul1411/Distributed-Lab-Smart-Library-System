import axios from 'axios';

export class CircuitBreaker {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    this.failureThreshold = 3;
    this.successThreshold = 2;
    this.timeout = 5000;
  }

  async call(endpoint, data = null, method = 'get') {
    if (this.state === 'OPEN') {
      if (this.nextAttempt <= Date.now()) {
        this.state = 'HALF-OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        data,
        timeout: this.timeout
      });

      return this.success(response);
    } catch (error) {
      return this.fail(error);
    }
  }

  success(response) {
    if (this.state === 'HALF-OPEN') {
      this.successCount++;
      if (this.successCount > this.successThreshold) {
        this.reset();
      }
    }
    return response;
  }

  fail(error) {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
    throw error;
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = 0;
  }
}
