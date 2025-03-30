class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.message = message;
    this.status = status;
  }
}

export { ApiError };
