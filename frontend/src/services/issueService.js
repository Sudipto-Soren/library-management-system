import api from './api'

export const issueService = {
  issueBook: (bookId) => api.post('/issues/issue', { bookId }),
  returnBook: (issueId) => api.post(`/issues/return/${issueId}`),
  getMyIssues: (page = 0, size = 10) =>
    api.get(`/issues/my-issues?page=${page}&size=${size}`),
  getAllIssues: (page = 0, size = 10) =>
    api.get(`/issues?page=${page}&size=${size}`),
}
