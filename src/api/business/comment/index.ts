import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 查询评论列表
 * @param query
 * @returns {*}
 */

export const listCommentInfo = (query?: any): AxiosPromise<any[]> => {
  return request({
    url: '/business/projectCommentInfo/page',
    method: 'get',
    params: query
  });
};

/**
 * 查询回复列表
 * @param query
 * @returns {*}
 */

export const listReplyInfo = (query?: any): AxiosPromise<any[]> => {
  return request({
    url: '/business/projectCommentInfo/reply',
    method: 'get',
    params: query
  });
};



/**
 * 新增评论信息
 * @param data
 */
export const addCommentInfo = (data: any) => {
  return request({
    url: '/business/projectCommentInfo',
    method: 'post',
    data: data
  });
};
