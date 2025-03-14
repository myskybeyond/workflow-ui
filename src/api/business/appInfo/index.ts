import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { AppInfoVO, AppInfoForm, AppInfoQuery } from '@/api/business/appInfo/types';

/**
 * 查询应用信息列表
 * @param query
 * @returns {*}
 */

export const listAppInfo = (query?: AppInfoQuery): AxiosPromise<AppInfoVO[]> => {
  return request({
    url: '/business/appInfo/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询应用信息详细
 * @param id
 */
export const getAppInfo = (id: string | number): AxiosPromise<AppInfoVO> => {
  return request({
    url: '/business/appInfo/' + id,
    method: 'get'
  });
};

/**
 * 新增应用信息
 * @param data
 */
export const addAppInfo = (data: AppInfoForm) => {
  return request({
    url: '/business/appInfo',
    method: 'post',
    data: data
  });
};

/**
 * 修改应用信息
 * @param data
 */
export const updateAppInfo = (data: AppInfoForm) => {
  return request({
    url: '/business/appInfo',
    method: 'put',
    data: data
  });
};

/**
 * 删除应用信息
 * @param id
 */
export const delAppInfo = (id: string | number | Array<string | number>) => {
  return request({
    url: '/business/appInfo/' + id,
    method: 'delete'
  });
};

/**
 * 修改应用信息
 * @param rowId
 * @param state
 */
export const changeState = (rowId?: string | number, state?: string | number) => {
  return request({
    url: '/business/appInfo/changeState',
    method: 'put',
    data: { id: rowId, status: state }
  });
};

export const listAll = (query?: any): AxiosPromise<AppInfoVO[]> => {
  return request({
    url: '/business/appInfo/listAll',
    method: 'get',
    params: query
  });
};
