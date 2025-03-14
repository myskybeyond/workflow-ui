import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { TemplateInfoVO, TemplateInfoForm, TemplateInfoQuery } from '@/api/business/templateInfo/types';

/**
 * 查询项目资料模板列表
 * @param query
 * @returns {*}
 */

export const listTemplateInfo = (query?: TemplateInfoQuery): AxiosPromise<TemplateInfoVO[]> => {
  return request({
    url: '/business/templateInfo/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询项目资料模板详细
 * @param id
 */
export const getTemplateInfo = (id: string | number): AxiosPromise<TemplateInfoVO> => {
  return request({
    url: '/business/templateInfo/' + id,
    method: 'get'
  });
};

/**
 * 新增项目资料模板
 * @param data
 */
export const addTemplateInfo = (data: TemplateInfoForm) => {
  return request({
    url: '/business/templateInfo',
    method: 'post',
    data: data
  });
};

/**
 * 修改项目资料模板
 * @param data
 */
export const updateTemplateInfo = (data: TemplateInfoForm) => {
  return request({
    url: '/business/templateInfo',
    method: 'put',
    data: data
  });
};

/**
 * 删除项目资料模板
 * @param id
 */
export const delTemplateInfo = (id: string | number | Array<string | number>) => {
  return request({
    url: '/business/templateInfo/' + id,
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
    url: '/business/templateInfo/changeStatus',
    method: 'put',
    data: data
  });
}
