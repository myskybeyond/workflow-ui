import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { FormVO, FormForm, FormQuery } from '@/api/workflow/form/types';

/**
 * 查询流程单信息列表
 * @param query
 * @returns {*}
 */

export const listForm = (query?: FormQuery): AxiosPromise<FormVO[]> => {
  return request({
    url: '/workflow/form/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询流程单信息详细
 * @param formId
 */
export const getForm = (formId: string | number): AxiosPromise<FormVO> => {
  return request({
    url: '/workflow/form/' + formId,
    method: 'get'
  });
};

/**
 * 新增流程单信息
 * @param data
 */
export const addForm = (data: FormForm) => {
  return request({
    url: '/workflow/form',
    method: 'post',
    data: data
  });
};

/**
 * 修改流程单信息
 * @param data
 */
export const updateForm = (data: FormForm) => {
  return request({
    url: '/workflow/form',
    method: 'put',
    data: data
  });
};

/**
 * 删除流程单信息
 * @param formId
 */
export const delForm = (formId: string | number | Array<string | number>) => {
  return request({
    url: '/workflow/form/' + formId,
    method: 'delete'
  });
};
