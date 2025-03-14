import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ComponentInfoVO, ComponentInfoForm, ComponentInfoQuery } from '@/api/business/componentInfo/types';

/**
 * 查询构件信息列表
 * @param query
 * @returns {*}
 */

export const listComponentInfo = (query?: ComponentInfoQuery): AxiosPromise<ComponentInfoVO[]> => {
  return request({
    url: '/business/componentInfo/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询构件信息详细
 * @param id
 */
export const getComponentInfo = (id: string | number): AxiosPromise<ComponentInfoVO> => {
  return request({
    url: '/business/componentInfo/' + id,
    method: 'get'
  });
};

/**
 * 新增构件信息
 * @param data
 */
export const addComponentInfo = (data: ComponentInfoForm) => {
  return request({
    url: '/business/componentInfo',
    method: 'post',
    data: data
  });
};

/**
 * 修改构件信息
 * @param data
 */
export const updateComponentInfo = (data: ComponentInfoForm) => {
  return request({
    url: '/business/componentInfo',
    method: 'put',
    data: data
  });
};

/**
 * 删除构件信息
 * @param id
 */
export const delComponentInfo = (id: string | number | Array<string | number>) => {
  return request({
    url: '/business/componentInfo/' + id,
    method: 'delete'
  });
};

/**
 * 状态修改
 * @param id ID
 * @param status 状态
 */
export function changeStatus(id: number | string, status: number | string) {
  const data = {
    id,
    status
  };
  return request({
    url: '/business/componentInfo/changeStatus',
    method: 'put',
    data: data
  });
}
