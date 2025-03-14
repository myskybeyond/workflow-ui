import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CategoryVO, CategoryForm, CategoryQuery, DataGroupByCategoryVo } from '@/api/workflow/category/types';

/**
 * 查询流程分类列表
 * @param query
 * @returns {*}
 */

export const listCategory = (query?: CategoryQuery): AxiosPromise<CategoryVO[]> => {
  return request({
    url: '/workflow/category/list',
    method: 'get',
    params: query
  });
};

// 查询流程分类列表
export const listAllCategory = (query?: CategoryQuery): AxiosPromise<CategoryVO[]> => {
  return request({
    url: '/workflow/category/listAll',
    method: 'get',
    params: query
  });
};
/**
 * 查询流程分类详细
 * @param categoryId
 */
export const getCategory = (categoryId: string | number): AxiosPromise<CategoryVO> => {
  return request({
    url: '/workflow/category/' + categoryId,
    method: 'get'
  });
};

/**
 * 新增流程分类
 * @param data
 */
export const addCategory = (data: CategoryForm) => {
  return request({
    url: '/workflow/category',
    method: 'post',
    data: data
  });
};

/**
 * 修改流程分类
 * @param data
 */
export const updateCategory = (data: CategoryForm) => {
  return request({
    url: '/workflow/category',
    method: 'put',
    data: data
  });
};

/**
 * 删除流程分类
 * @param categoryId
 */
export const delCategory = (categoryId: string | number | Array<string | number>) => {
  return request({
    url: '/workflow/category/' + categoryId,
    method: 'delete'
  });
};

export const totalModalGroupByCategory = (): AxiosPromise<DataGroupByCategoryVo[]> => {
  return request({
    url: '/workflow/category/totalModalGroupByCategory',
    method: 'get'
  });
};

export const totalDeploymentGroupByCategory = (): AxiosPromise<DataGroupByCategoryVo[]> => {
  return request({
    url: '/workflow/category/totalDeploymentGroupByCategory',
    method: 'get'
  });
};

export const totalMyProcessGroupByCategory = (): AxiosPromise<DataGroupByCategoryVo[]> => {
  return request({
    url: '/workflow/category/totalMyProcessGroupByCategory',
    method: 'get'
  });
};

export const totalToDoTaskGroupByCategory = (): AxiosPromise<DataGroupByCategoryVo[]> => {
  return request({
    url: '/workflow/category/totalToDoTaskGroupByCategory',
    method: 'get'
  });
};

export const totalFlowStartGroupByCategory = (): AxiosPromise<DataGroupByCategoryVo[]> => {
  return request({
    url: '/workflow/category/totalFlowStartGroupByCategory',
    method: 'get'
  });
};

export const totalFinishedGroupByCategory = (): AxiosPromise<DataGroupByCategoryVo[]> => {
  return request({
    url: '/workflow/category/totalFinishedGroupByCategory',
    method: 'get'
  });
};
export const totalClaimGroupByCategory = (): AxiosPromise<DataGroupByCategoryVo[]> => {
  return request({
    url: '/workflow/category/totalClaimGroupByCategory',
    method: 'get'
  });
};
export const totalProcessGroupByCategory = (): AxiosPromise<DataGroupByCategoryVo[]> => {
  return request({
    url: '/workflow/category/totalProcessGroupByCategory',
    method: 'get'
  });
};
export const totalTaskGroupByCategory = (): AxiosPromise<DataGroupByCategoryVo[]> => {
  return request({
    url: '/workflow/category/totalTaskGroupByCategory',
    method: 'get'
  });
};
export const totalFormGroupByCategory = (): AxiosPromise<DataGroupByCategoryVo[]> => {
  return request({
    url: '/workflow/category/totalFormGroupByCategory',
    method: 'get'
  });
};
