import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CategoryInfoVO, CategoryInfoForm, CategoryInfoQuery } from '@/api/business/categoryInfo/types';

/**
 * 查询系统类别信息列表
 * @param query
 * @returns {*}
 */

export const listCategoryInfo = (query?: CategoryInfoQuery): AxiosPromise<CategoryInfoVO[]> => {
  return request({
    url: '/business/categoryInfo/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询系统类别信息详细
 * @param id
 */
export const getCategoryInfo = (id: string | number): AxiosPromise<CategoryInfoVO> => {
  return request({
    url: '/business/categoryInfo/' + id,
    method: 'get'
  });
};

/**
 * 新增系统类别信息
 * @param data
 */
export const addCategoryInfo = (data: CategoryInfoForm) => {
  return request({
    url: '/business/categoryInfo',
    method: 'post',
    data: data
  });
};

/**
 * 修改系统类别信息
 * @param data
 */
export const updateCategoryInfo = (data: CategoryInfoForm) => {
  return request({
    url: '/business/categoryInfo',
    method: 'put',
    data: data
  });
};

/**
 * 删除系统类别信息
 * @param id
 */
export const delCategoryInfo = (id: string | number | Array<string | number>) => {
  return request({
    url: '/business/categoryInfo/' + id,
    method: 'delete'
  });
};
/**
 * 查询系统类别信息列表
 * @param query
 * @returns {*}
 */

export const listCategoryInfoNum = (query?: CategoryInfoQuery): AxiosPromise<CategoryInfoVO[]> => {
  return request({
    url: '/business/categoryInfo/numList',
    method: 'get',
    params: query
  });
};

/**
 * 查询系统类别信息列表
 * @param query
 * @returns {*}
 */

export const listCategoryInfoFileNum = (query?: CategoryInfoQuery): AxiosPromise<CategoryInfoVO[]> => {
  return request({
    url: '/business/categoryInfo/fileNumList',
    method: 'get',
    params: query
  });
};

export const listCategoryInfoMyFileNum = (query?: CategoryInfoQuery): AxiosPromise<CategoryInfoVO[]> => {
  return request({
    url: '/business/categoryInfo/myFileNumList',
    method: 'get',
    params: query
  });
};

