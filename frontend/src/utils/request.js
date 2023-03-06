import { getToken } from './index';
import { message } from 'antd';
import { API_HOST } from './const';

const canSendData = (method = 'get') => ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());

export default function _fetch (url, options = {}) {
  const { method, data, token, author, body } = options;
  console.log('data' + data)
  const opts = {
    method: method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token || getToken()}`,
    },
    cache: 'no-cache',
    body: canSendData(method) ? JSON.stringify(data || {}) : undefined,
  }
  if (url === '/login') {
    opts.headers.Authorization = author
  }
  console.log(opts)
  // if (url === '/recipes/photo/8') {
  //   opts.headers = {
  //     Accept: 'application/json',
  //     Authorization: `Bearer ${token || getToken()}`,
  //   }
  //   opts.body = body
  // }

  return fetch(`${API_HOST}${url}`, opts)
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        if (data.error.includes('invalid token')) {
          message.error('Token expired, please login again!');
          localStorage.removeItem('user');
          localStorage.removeItem('user_token');
          localStorage.removeItem('id');
          location.href = '/login';
        } else if (data.error.includes('Unauthorized')) {
          message.error('Unauthorized, please login again!');
          localStorage.removeItem('user');
          localStorage.removeItem('user_token');
          localStorage.removeItem('id');
          location.href = '/login';
        } else {
          message.error(data.error, 'error');
        }
        return data;
      }
      return data;
    });
}
