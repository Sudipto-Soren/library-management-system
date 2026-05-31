import api from './api'

export const bookService = {
  getBooks: (page = 0, size = 10, sortBy = 'title', sortDir = 'asc') =>
    api.get(`/books?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  getBook: (id) => api.get(`/books/${id}`),
  searchBooks: (keyword, page = 0, size = 10) =>
    api.get(`/books/search?keyword=${keyword}&page=${page}&size=${size}`),
  addBook: (data) => api.post('/books', data),
  updateBook: (id, data) => api.put(`/books/${id}`, data),
  deleteBook: (id) => api.delete(`/books/${id}`),
}
