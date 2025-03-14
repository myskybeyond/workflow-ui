import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SmsInfoQuery, SmsInfoVO } from '@/api/business/smsInfo/types';

/**
 * 查询消息历史记录信息列表
 * @param query
 * @returns {*}
 */

export const listSmsInfo = (query?: SmsInfoQuery): AxiosPromise<SmsInfoVO[]> => {
  return request({
    url: '/business/smsInfo/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询消息历史记录信息详细
 * @param id
 */
export const getSmsInfo = (id: string | number): AxiosPromise<SmsInfoVO> => {
  return request({
    url: '/business/smsInfo/' + id,
    method: 'get'
  });
};

/**
 * 消息设置为已读
 * @param id
 */
export const markRead = (id: string | number | Array<string | number>) => {
  return request({
    url: '/business/smsInfo/read/' + id,
    method: 'post'
  });
};

/**
 * 消息设置为已读
 * @param id
 */
export const markAllRead = (id: string | number) => {
  return request({
    url: '/business/smsInfo/allRead/' + id,
    method: 'post'
  });
};

/**
 * 查询我的消息历史记录信息列表
 * @param query
 * @returns {*}
 */

export const listMySmsInfo = (query?: SmsInfoQuery): AxiosPromise<SmsInfoVO[]> => {
  return request({
    url: '/business/smsInfo/list/my',
    method: 'get',
    params: query
  });
};
