import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SmsTemplateInfoVO, SmsTemplateInfoForm, SmsTemplateInfoQuery } from '@/api/business/smsTemplateInfo/types';

/**
 * 查询消息模板信息列表
 * @param query
 * @returns {*}
 */

export const listSmsTemplateInfo = (query?: SmsTemplateInfoQuery): AxiosPromise<SmsTemplateInfoVO[]> => {
  return request({
    url: '/business/smsTemplateInfo/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询消息模板信息详细
 * @param id
 */
export const getSmsTemplateInfo = (id: string | number): AxiosPromise<SmsTemplateInfoVO> => {
  return request({
    url: '/business/smsTemplateInfo/' + id,
    method: 'get'
  });
};

/**
 * 新增消息模板信息
 * @param data
 */
export const addSmsTemplateInfo = (data: SmsTemplateInfoForm) => {
  return request({
    url: '/business/smsTemplateInfo',
    method: 'post',
    data: data
  });
};

/**
 * 修改消息模板信息
 * @param data
 */
export const updateSmsTemplateInfo = (data: SmsTemplateInfoForm) => {
  return request({
    url: '/business/smsTemplateInfo',
    method: 'put',
    data: data
  });
};

/**
 * 删除消息模板信息
 * @param id
 */
export const delSmsTemplateInfo = (id: string | number | Array<string | number>) => {
  return request({
    url: '/business/smsTemplateInfo/' + id,
    method: 'delete'
  });
};

/**
 * 修改应用信息
 * @param data
 */
export const changeState = (rowId?: string | number, state?: string | number) => {
  return request({
    url: '/business/smsTemplateInfo/changeState',
    method: 'put',
    data: { id: rowId, status: state }
  });
};

/**
 * 测试模板消息发送
 * @param data
 */
export const testSendTemplateMsg = (data: any) => {
  return request({
    url: '/business/smsTemplateInfo/testSend',
    method: 'put',
    data: data
  });
};
