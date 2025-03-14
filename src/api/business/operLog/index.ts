import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 查询操作日志列表
 * @param query
 * @returns {*}
 */

export const listLogInfo = (query?: any): AxiosPromise<any[]> => {
  return request({
    url: '/business/projectOperLog/list',
    method: 'get',
    params: query
  });
};
