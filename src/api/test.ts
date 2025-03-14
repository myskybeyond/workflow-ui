import axios, { AxiosPromise } from 'axios';
import request from '@/utils/request';

export function addString(data): AxiosPromise {
  return request({
    url: '/test/add',
    method: 'post',
    data: data
  });
}
export function getString(): AxiosPromise {
  return request({
    url: '/test/get',
    method: 'get'
  });
}
export function addFile(file: string | Blob): AxiosPromise {
  const formData = new FormData();
  formData.append('file', file);
  return request.postForm('/test/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
